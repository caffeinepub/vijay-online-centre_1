import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Authentication context
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ApplicationStatus = {
    #documentsUploaded;
    #awaitingPrice;
    #priceSet;
    #paymentPendingVerification;
    #completed;
  };

  // Types
  type Document = {
    name : Text;
    content : Storage.ExternalBlob;
  };

  type Application = {
    id : Text;
    name : Text;
    phoneNumber : Text;
    service : Text;
    status : ApplicationStatus;
    price : ?Nat;
    documents : [Document];
  };

  type UserProfile = {
    name : Text;
  };

  let validCredentials = {
    username = "vijay@123";
    password = "vijay@123456";
  };

  // Persistent maps
  let applications = Map.empty<Text, Application>();
  let rejectionMessages = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  /// User profile functions required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// Admin login using static credentials — returns session token on success
  public query func adminLogin(username : Text, password : Text) : async Text {
    if (username == validCredentials.username and password == validCredentials.password) {
      "SESSION123";
    } else {
      "error: Invalid credentials. Must login as 'vijay@123' with password 'vijay@123456'.";
    };
  };

  /// Submit application with documents (documentsUploaded state)
  public shared ({ caller }) func addApplication(
    id : Text,
    name : Text,
    phoneNumber : Text,
    service : Text,
    documents : [Document],
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit applications");
    };
    let newApp = {
      id;
      name;
      phoneNumber;
      service;
      status = #documentsUploaded;
      price = null;
      documents;
    };
    applications.add(id, newApp);
    true;
  };

  /// Set application fee (moves to priceSet) — admin only
  public shared ({ caller }) func setApplicationFee(appId : Text, fee : Nat, adminToken : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set application fees");
    };
    if (adminToken != "SESSION123") {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #awaitingPrice or application.status == #documentsUploaded) {
          applications.add(
            appId,
            {
              application with
              status = #priceSet;
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

  /// Check if user can proceed to payment (status must be priceSet)
  public query func canUserPay(appId : Text) : async Bool {
    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        application.status == #priceSet;
      };
    };
  };

  /// "I Have Paid" — moves status to paymentPendingVerification
  public shared ({ caller }) func markPaymentPendingVerification(appId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can progress to payment verification");
    };
    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #priceSet) {
          applications.add(
            appId,
            {
              application with status = #paymentPendingVerification
            },
          );
          true;
        } else {
          false;
        };
      };
    };
  };

  /// Reject application and provide rejection message — admin only
  public shared ({ caller }) func rejectApplication(appId : Text, adminToken : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject applications");
    };
    if (adminToken != "SESSION123") {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (_) {
        applications.remove(appId);
        rejectionMessages.add(appId, "Your request was rejected by Vijay Ji. Please contact for details.");
        true;
      };
    };
  };

  /// Get rejection message — open to anyone
  public query func getRejectionMessage(appId : Text) : async ?Text {
    rejectionMessages.get(appId);
  };

  /// Confirm payment — admin only (moves from paymentPendingVerification to completed)
  public shared ({ caller }) func confirmPayment(appId : Text, adminToken : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm payments");
    };
    if (adminToken != "SESSION123") {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        if (application.status == #paymentPendingVerification) {
          applications.add(
            appId,
            {
              application with status = #completed
            },
          );
          true;
        } else {
          false;
        };
      };
    };
  };

  /// Get applications filtered by status — admin only
  public query ({ caller }) func getApplicationsByStatus(status : ApplicationStatus, adminToken : Text) : async [Application] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view applications by status");
    };
    if (adminToken != "SESSION123") {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    let filtered = applications.values().filter(
      func(a) { a.status == status }
    );
    filtered.toArray();
  };

  /// Update application status — admin only
  public shared ({ caller }) func updateApplicationStatus(appId : Text, status : ApplicationStatus, adminToken : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update application status");
    };
    if (adminToken != "SESSION123") {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    switch (applications.get(appId)) {
      case (null) { false };
      case (?application) {
        applications.add(
          appId,
          {
            application with status
          },
        );
        true;
      };
    };
  };

  /// Get a single application by ID — accessible to users (own) or admins
  public query ({ caller }) func getApplication(appId : Text) : async ?Application {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user)) and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Must be a user or admin to view applications");
    };
    applications.get(appId);
  };
};
