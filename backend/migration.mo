import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldCustomer = {
    id : Nat;
    name : Text;
    mobile : Text;
    service : Text;
    amount : Float;
    status : Text;
    createdAt : Int;
  };

  type OldActor = {
    customers : Map.Map<Nat, OldCustomer>;
    nextCustomerId : Nat;
  };

  type NewCustomer = {
    id : Nat;
    name : Text;
    mobile : Text;
    service : Text;
    amount : Float;
    status : Text;
    createdAt : Int;
    paymentStatus : Text;
    paymentDate : ?Int;
    receiptId : ?Text;
  };

  type NewActor = {
    customers : Map.Map<Nat, NewCustomer>;
    nextCustomerId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newCustomers = old.customers.map<Nat, OldCustomer, NewCustomer>(
      func(_id, oldCustomer) {
        { oldCustomer with paymentStatus = "pending"; paymentDate = null; receiptId = null };
      }
    );
    { old with customers = newCustomers };
  };
};
