"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Plus, Search, X } from "lucide-react";

interface Stamp {
  id: string;
  isClaimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

interface StampCard {
  id: string;
  phoneNumber: string;
  firstName: string;
  stampsRequired: number;
  createdAt: string;
  updatedAt: string;
  stamps: Stamp[];
  totalStamps: number;
  claimedStamps: number;
  unclaimedStamps: number;
  canClaim: boolean;
}

export default function CustomersPage() {
  const [stampCards, setStampCards] = useState<StampCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchBy, setSearchBy] = useState("contact"); // "contact" or "cardNumber"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StampCard | null>(null);
  const [claimAmount, setClaimAmount] = useState(9);

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    phoneNumber: "",
    firstName: "",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: "",
  });

  const [phoneNumberValid, setPhoneNumberValid] = useState(false);

  // Mock location ID - in real app, this would come from context/auth
  const locationId = "loc1";

  const searchStampCards = async () => {
    if (!searchPhone.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/stampcards?phone=${encodeURIComponent(
          searchPhone
        )}&locationId=${locationId}`
      );
      const data = await response.json();
      setStampCards(data);
    } catch (error) {
      console.error("Error searching stampcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentStampCards = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/stampcards?recent=true&locationId=${locationId}`
      );
      const data = await response.json();
      setStampCards(data);
    } catch (error) {
      console.error("Error fetching recent stampcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const createStampCard = async () => {
    if (
      !createFormData.phoneNumber ||
      !createFormData.firstName ||
      !phoneNumberValid
    ) {
      alert("Please fill in all required fields with valid data");
      return;
    }

    try {
      const response = await fetch("/api/admin/stampcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createFormData,
          locationId,
        }),
      });

      if (response.ok) {
        const newCard = await response.json();
        setStampCards([newCard, ...stampCards]);
        setShowCreateModal(false);
        setCreateFormData({
          phoneNumber: "",
          firstName: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create stampcard");
      }
    } catch (error) {
      console.error("Error creating stampcard:", error);
      alert("Failed to create stampcard");
    }
  };

  const addStamp = async (stampCardId: string) => {
    try {
      const response = await fetch("/api/admin/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampCardId }),
      });

      if (response.ok) {
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add stamp");
      }
    } catch (error) {
      console.error("Error adding stamp:", error);
      alert("Failed to add stamp");
    }
  };

  const openClaimModal = (card: StampCard) => {
    setSelectedCard(card);
    setClaimAmount(9); // Default minimum
    setShowClaimModal(true);
  };

  const confirmClaim = async () => {
    if (!selectedCard) return;

    try {
      const response = await fetch("/api/admin/stamps/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stampCardId: selectedCard.id,
          claimCount: claimAmount,
        }),
      });

      if (response.ok) {
        setShowClaimModal(false);
        setSelectedCard(null);
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to claim stamps");
      }
    } catch (error) {
      console.error("Error claiming stamps:", error);
      alert("Failed to claim stamps");
    }
  };

  const undoLastStamp = async (stampCardId: string) => {
    try {
      const response = await fetch("/api/admin/stamps/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampCardId }),
      });

      if (response.ok) {
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to undo stamp");
      }
    } catch (error) {
      console.error("Error undoing stamp:", error);
      alert("Failed to undo stamp");
    }
  };

  const openEditModal = (card: StampCard) => {
    setSelectedCard(card);
    setEditFormData({
      firstName: card.firstName,
    });
    setShowEditModal(true);
  };

  const updateStampCard = async () => {
    if (!selectedCard || !editFormData.firstName) return;

    try {
      const response = await fetch(`/api/admin/stampcards/${selectedCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setStampCards(
          stampCards.map((card) =>
            card.id === selectedCard.id ? updatedCard : card
          )
        );
        setShowEditModal(false);
        setSelectedCard(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update stampcard");
      }
    } catch (error) {
      console.error("Error updating stampcard:", error);
      alert("Failed to update stampcard");
    }
  };

  const getCountryFlag = (phoneNumber: string) => {
    if (phoneNumber.startsWith("+358")) return "🇫🇮";
    if (phoneNumber.startsWith("+46")) return "🇸🇪";
    if (phoneNumber.startsWith("+47")) return "🇳🇴";
    if (phoneNumber.startsWith("+45")) return "🇩🇰";
    if (phoneNumber.startsWith("+1")) return "🇺🇸";
    if (phoneNumber.startsWith("+44")) return "🇬🇧";
    if (phoneNumber.startsWith("+49")) return "🇩🇪";
    return "🌍";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Stamp Card</h1>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={searchBy === "contact" ? "default" : "outline"}
                  onClick={() => setSearchBy("contact")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Contact Info
                </Button>
                <Button
                  variant={searchBy === "cardNumber" ? "default" : "outline"}
                  onClick={() => setSearchBy("cardNumber")}
                >
                  Card Number
                </Button>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    {searchBy === "contact"
                      ? "Phone number or name"
                      : "Card Number"}
                  </label>
                  <Input
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder={
                      searchBy === "contact"
                        ? "Enter phone number or name"
                        : "Enter card number"
                    }
                    onKeyDown={(e) => e.key === "Enter" && searchStampCards()}
                  />
                </div>
                <Button onClick={searchStampCards} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <Button
              onClick={() => getRecentStampCards()}
              variant="outline"
              className="ml-4"
            >
              Last 30 Created
            </Button>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Stamp Card
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      )}

      {!loading && stampCards.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="text-sm text-gray-600 p-4 border-b">
              Found {stampCards.length} matches
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-700">
              <div>Phone Number</div>
              <div>Country</div>
              <div>First Name</div>
              <div>Unclaimed Stamps</div>
              <div>Claim History</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            {stampCards.map((card) => (
              <div
                key={card.id}
                className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div className="font-mono text-sm">{card.phoneNumber}</div>
                <div className="text-2xl">
                  {getCountryFlag(card.phoneNumber)}
                </div>
                <div>{card.firstName}</div>
                <div className="font-semibold">{card.unclaimedStamps}</div>
                <div className="text-gray-600">
                  {card.claimedStamps > 0
                    ? `${card.claimedStamps} claimed`
                    : "No claims yet"}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => addStamp(card.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                  >
                    + Stamp
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openClaimModal(card)}
                    disabled={card.unclaimedStamps < 9}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 px-3"
                  >
                    Claim
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => undoLastStamp(card.id)}
                    disabled={card.totalStamps === 0}
                    className="px-3"
                  >
                    Undo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(card)}
                    className="px-3"
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && stampCards.length === 0 && searchPhone && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">No stampcards found</div>
          </CardContent>
        </Card>
      )}

      {/* Create Stamp Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create Stamp Card</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <PhoneInput
                  value={createFormData.phoneNumber}
                  onChange={(phone, isValid) => {
                    setCreateFormData((prev) => ({
                      ...prev,
                      phoneNumber: phone,
                    }));
                    setPhoneNumberValid(isValid);
                  }}
                  defaultCountry="FI"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <Input
                  value={createFormData.firstName}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="John"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={createStampCard}
                disabled={!phoneNumberValid || !createFormData.firstName}
                className="flex-1 bg-gray-200 text-gray-400 hover:bg-gray-300 disabled:bg-gray-100"
              >
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateFormData({
                    phoneNumber: "",
                    firstName: "",
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Stamps Modal */}
      {showClaimModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirm Claim</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClaimModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p>
                Claim stamps for <strong>{selectedCard.firstName}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                Customer has {selectedCard.unclaimedStamps} unclaimed stamps.
              </p>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of stamps to claim
                </label>
                <Input
                  type="number"
                  value={claimAmount}
                  onChange={(e) =>
                    setClaimAmount(parseInt(e.target.value) || 9)
                  }
                  min="1"
                  max={selectedCard.unclaimedStamps}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={confirmClaim}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm Claim
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowClaimModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stamp Card Modal */}
      {showEditModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  value={selectedCard.phoneNumber}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <Input
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="First name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total stamps:</span>
                  <span className="ml-2 font-semibold">
                    {selectedCard.totalStamps}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Claimed:</span>
                  <span className="ml-2 font-semibold">
                    {selectedCard.claimedStamps}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Unclaimed:</span>
                  <span className="ml-2 font-semibold">
                    {selectedCard.unclaimedStamps}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(selectedCard.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={updateStampCard}
                disabled={!editFormData.firstName}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
