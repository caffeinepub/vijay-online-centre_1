import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";


(with migration = Migration.run)
actor {
  include MixinStorage();

  type Document = {
    name : Text;
    content : Storage.ExternalBlob;
  };

  type RejectionInfo = {
    reason : Text;
    timestamp : Int;
  };

  type ApplicationStatus = {
    #submitted;
    #feeSet;
    #paymentPending;
    #paymentVerifying;
    #completed;
    #rejected;
  };

  public type ApplicationFormData = {
    id : Text;
    applicantName : Text;
    phoneNumber : Text;
    service : Text;
    documents : [Document];
  };

  public type Application = {
    id : Text;
    applicantName : Text;
    phoneNumber : Text;
    service : Text;
    status : ApplicationStatus;
    price : ?Nat;
    documents : [Document];
    transactionId : ?Text;
    rejection : ?RejectionInfo;
    stage : Nat;
  };

  public type UserProfile = {
    name : Text;
    phoneNumber : ?Text;
    role : Text;
  };

  type ManagerNotification = {
    message : Text;
    timestamp : Int;
  };

  type Service = {
    serviceId : Nat;
    name : Text;
    price : Nat;
  };

  public type AuthResult = {
    role : Text;
    token : Text;
  };

  type Customer = {
    id : Nat;
    name : Text;
    mobile : Text;
    service : Text;
    amount : Float;
    status : Text;
    createdAt : Int;
    paymentStatus : Text; // new: "pending", "success"
    paymentDate : ?Int;
    receiptId : ?Text;
  };

  let applications = Map.empty<Text, Application>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let managerNotifications = Map.empty<Nat, ManagerNotification>();
  var notificationCounter = 0;
  let services = Map.empty<Nat, Service>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var paymentQR : ?Storage.ExternalBlob = null;
  var currentPrice : Nat = 0;
  var nextCustomerId : Nat = 1;
  let customers = Map.empty<Nat, Customer>();

  // Private helper — never exposed as a canister endpoint
  private func isValidAdminToken(token : Text) : Bool {
    token == "VIJAY_ADMIN_TOKEN";
  };

  // ── Profile endpoints ────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view other users' profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Application endpoints ────────────────────────────────────────────

  public shared ({ caller }) func submitApplication(app : ApplicationFormData) : async Application {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit applications");
    };

    let newApp : Application = {
      app with
      status = #submitted;
      price = null;
      transactionId = null;
      rejection = null;
      stage = 0;
    };
    applications.add(app.id, newApp);

    let notification = {
      message = "New application submitted. Review pending: " # app.id;
      timestamp = 0;
    };
    managerNotifications.add(notificationCounter, notification);
    notificationCounter += 1;

    newApp;
  };

  public shared ({ caller }) func getManagerNotifications() : async [ManagerNotification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can retrieve manager notifications");
    };

    let notifications = managerNotifications.values().toArray();
    managerNotifications.clear();
    notifications;
  };

  public shared ({ caller }) func setApplicationFee(
    appId : Text,
    fee : Nat,
    adminToken : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Admin privileges required for setting application fees");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #submitted) {
          applications.add(
            appId,
            {
              application with
              status = #feeSet;
              price = ?fee;
            },
          );
          true;
        } else {
          false;
        };
      };
    };
  };

  public query func canUserPay(appId : Text) : async Bool {
    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) { application.status == #feeSet };
    };
  };

  public shared ({ caller }) func submitPayment(
    appId : Text,
    transactionId : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit payments");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #feeSet) {
          applications.add(
            appId,
            {
              application with
              status = #paymentPending;
              transactionId = ?transactionId;
            },
          );
          true;
        } else {
          false;
        };
      };
    };
  };

  public shared ({ caller }) func confirmPayment(
    appId : Text,
    adminToken : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Admin privileges required for payment confirmation");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #paymentPending) {
          applications.add(
            appId,
            {
              application with
              status = #completed;
              transactionId = application.transactionId;
            },
          );
          true;
        } else {
          false;
        };
      };
    };
  };

  public shared ({ caller }) func rejectApplication(
    appId : Text,
    reason : Text,
    adminToken : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Admin privileges required to reject applications");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        applications.add(
          appId,
          {
            application with
            status = #rejected;
            rejection = ?{
              reason;
              timestamp = 0;
            };
          },
        );
        true;
      };
    };
  };

  public shared ({ caller }) func updateApplicationStage(
    appId : Text,
    stage : Nat,
    adminToken : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Only admins can update application stages");
    };

    if (stage > 4) {
      Runtime.trap("Invalid stage. Must be between 0 and 4");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        applications.add(
          appId,
          {
            application with
            stage;
          },
        );
        true;
      };
    };
  };

  public query func getApplication(appId : Text) : async ?Application {
    applications.get(appId);
  };

  public query ({ caller }) func getAllApplications() : async [Application] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    applications.values().toArray();
  };

  public query ({ caller }) func getUserApplications(
    user : Text,
    adminToken : Text,
  ) : async [Application] {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Only admins can filter user applications");
    };
    let filtered = applications.values().filter(
      func(a) { a.applicantName == user }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getApplicationsByStatus(
    status : ApplicationStatus,
    adminToken : Text,
  ) : async [Application] {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Only admins can filter applications by status");
    };

    let filtered = applications.values().filter(
      func(a) { a.status == status }
    );
    filtered.toArray();
  };

  public query func getRejectionReason(appId : Text) : async ?RejectionInfo {
    switch (applications.get(appId)) {
      case (null) { null };
      case (?application) { application.rejection };
    };
  };

  public query func getApplicationFee(appId : Text) : async ?Nat {
    switch (applications.get(appId)) {
      case (null) { null };
      case (?application) { application.price };
    };
  };

  public shared ({ caller }) func clearNotification(notificationId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear notifications");
    };

    switch (managerNotifications.get(notificationId)) {
      case (null) { false };
      case (?_notification) {
        managerNotifications.remove(notificationId);
        true;
      };
    };
  };

  public query ({ caller }) func getAllNotifications() : async [ManagerNotification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all notifications");
    };

    managerNotifications.values().toArray();
  };

  // ── Service / payment endpoints ─────────────────────────────────────

  public shared ({ caller }) func setServicePrice(serviceId : Nat, name : Text, price : Nat, adminToken : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Admin privileges required for setting service prices");
    };

    let service = {
      serviceId;
      name;
      price;
    };
    services.add(serviceId, service);
    true;
  };

  public query func getServicePrice(serviceId : Nat) : async ?Nat {
    switch (services.get(serviceId)) {
      case (null) { null };
      case (?service) { ?service.price };
    };
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public shared ({ caller }) func setPaymentQR(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the payment QR code");
    };
    paymentQR := ?blob;
  };

  public shared ({ caller }) func setActivePrice(amount : Nat, adminToken : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not (isValidAdminToken(adminToken))) {
      Runtime.trap("Unauthorized: Only admins can set the payment amount");
    };
    currentPrice := amount;
  };

  public query func getPaymentDetails() : async {
    qr : ?Storage.ExternalBlob;
    upiDetails : Text;
    amount : Nat;
  } {
    {
      qr = if (currentPrice > 0) { paymentQR } else { null };
      upiDetails = if (currentPrice > 0) {
        "Account: 8173064549@okicici, Name: Vijay Online Centre";
      } else {
        "";
      };
      amount = currentPrice;
    };
  };

  public query func getActivePaymentPrice() : async Nat {
    currentPrice;
  };

  public query func getPaymentIntentURL() : async Text {
    if (currentPrice > 0) {
      "upi://pay?pa=8173064549@okicici&pn=Vijay%20Online%20Centre&am=" # currentPrice.toText() # "&cu=INR";
    } else {
      "";
    };
  };

  public query func isPaymentActive() : async Bool {
    currentPrice > 0;
  };

  // ── Authentication ────────────────────────────────────────────────

  public query ({ caller }) func login(username : Text, password : Text) : async ?AuthResult {
    if (username == "vijay@123" and password == "vijay@2026") {
      ?{
        role = "admin";
        token = "VIJAY_ADMIN_TOKEN";
      };
    } else {
      Runtime.trap("Invalid credentials");
    };
  };

  // ── Customer endpoints ────────────────────────────────────────────

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can get all customers");
    };
    customers.values().toArray();
  };

  public shared ({ caller }) func addCustomer(name : Text, mobile : Text, service : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add customers");
    };

    let customer : Customer = {
      id = nextCustomerId;
      name;
      mobile;
      service;
      amount = 0.0;
      status = "active";
      createdAt = Time.now();
      paymentStatus = "pending";
      paymentDate = null;
      receiptId = null;
    };

    let id = nextCustomerId;
    customers.add(id, customer);
    nextCustomerId += 1;
    id;
  };

  public shared ({ caller }) func updateCustomerStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update customer status");
    };

    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        let updatedCustomer = { customer with status };
        customers.add(id, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func updateCustomerAmount(id : Nat, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update customer amount");
    };

    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        let updatedCustomer = { customer with amount };
        customers.add(id, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func updateCustomer(customer : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update customer");
    };

    switch (customers.get(customer.id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?_) {
        customers.add(customer.id, customer);
      };
    };
  };

  public shared ({ caller }) func markPaymentSuccess(customerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can mark payment success");
    };

    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        if (customer.paymentStatus == "success") {
          Runtime.trap("Payment already marked as success");
        };

        let timestamp = Time.now() / 1_000_000;
        let newReceiptId = "VOC" # timestamp.toText();

        let updatedCustomer = {
          customer with
          paymentStatus = "success";
          paymentDate = ?Time.now();
          receiptId = ?newReceiptId;
        };
        customers.add(customerId, updatedCustomer);
      };
    };
  };
};
