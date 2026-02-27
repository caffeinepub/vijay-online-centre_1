import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";

module {
  type ApplicationStatus = {
    #documentsUploaded;
    #awaitingPrice;
    #priceSet;
    #paymentPendingVerification;
    #completed;
  };

  type Document = {
    name : Text;
    content : Blob;
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

  type OldActor = {
    applications : Map.Map<Text, Application>;
    validCredentials : { username : Text; password : Text };
  };

  type NewActor = {
    applications : Map.Map<Text, Application>;
    validCredentials : { username : Text; password : Text };
    rejectionMessages : Map.Map<Text, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let rejectionMessages = Map.empty<Text, Text>();
    { old with rejectionMessages };
  };
};
