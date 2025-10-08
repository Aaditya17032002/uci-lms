
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { X, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface AssignApproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  users: { id: number; name: string }[];
  managers: { id: number; name: string }[];
  secondaryUsers: { id: number; name: string }[]; // Added secondary users
  loading?: boolean; // For dropdown loading
}

export function AssignApproverModal({
  isOpen,
  onClose,
  onSave,
  users,
  managers,
  secondaryUsers,
  loading = false
}: AssignApproverModalProps) {
  const [formData, setFormData] = useState({
    user: "",
    primaryApprover: "",
    secondaryApprover: ""
  });

  const [openUser, setOpenUser] = useState(false);
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [primarySearch, setPrimarySearch] = useState("");
  const [secondarySearch, setSecondarySearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData({ user: "", primaryApprover: "", secondaryApprover: "" });
      setUserSearch("");
      setPrimarySearch("");
      setSecondarySearch("");
    }
  }, [isOpen]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPrimaryManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(primarySearch.toLowerCase())
  );

  const filteredSecondaryUsers = secondaryUsers.filter(user =>
    user.name.toLowerCase().includes(secondarySearch.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.user || !formData.primaryApprover) {
      alert("User and Primary Approver are mandatory.");
      return;
    }

    onSave({
      user: Number(formData.user),
      primaryApprover: Number(formData.primaryApprover),
      secondaryApprover: formData.secondaryApprover === "none" ? 0 : Number(formData.secondaryApprover)
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
            Assign Approver
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* User */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-sm font-medium text-gray-700 dark:text-gray-300">User</Label>
            <Popover open={openUser} onOpenChange={setOpenUser}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
                >
                  <span className={formData.user ? "" : "text-gray-500 dark:text-gray-400"}>
                    {formData.user ? users.find(u => u.id.toString() === formData.user)?.name : "Select User"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <>
                    <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                      <input
                        type="text"
                        placeholder="Search user..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No user found.
                        </div>
                      ) : (
                        filteredUsers.map(user => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setFormData({ ...formData, user: user.id.toString() });
                              setOpenUser(false);
                              setUserSearch("");
                            }}
                            className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {user.name}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Primary Approver */}
          <div className="space-y-2">
            <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
            <Popover open={openPrimary} onOpenChange={setOpenPrimary}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
                >
                  <span className={formData.primaryApprover ? "" : "text-gray-500 dark:text-gray-400"}>
                    {formData.primaryApprover ? managers.find(m => m.id.toString() === formData.primaryApprover)?.name : "Select Approver"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <>
                    <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                      <input
                        type="text"
                        placeholder="Search approver..."
                        value={primarySearch}
                        onChange={(e) => setPrimarySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPrimaryManagers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No approver found.</div>
                      ) : (
                        filteredPrimaryManagers.map(manager => (
                          <div
                            key={manager.id}
                            onClick={() => {
                              setFormData({ ...formData, primaryApprover: manager.id.toString() });
                              setOpenPrimary(false);
                              setPrimarySearch("");
                            }}
                            className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {manager.name}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Secondary Approver */}
          <div className="space-y-2">
            <Label htmlFor="secondary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Approver</Label>
            <Popover open={openSecondary} onOpenChange={setOpenSecondary}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
                >
                  <span className={formData.secondaryApprover ? "" : "text-gray-500 dark:text-gray-400"}>
                    {formData.secondaryApprover === "none" ? "None" :
                      formData.secondaryApprover ? secondaryUsers.find(u => u.id.toString() === formData.secondaryApprover)?.name : "Select Approver"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <>
                    <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                      <input
                        type="text"
                        placeholder="Search approver..."
                        value={secondarySearch}
                        onChange={(e) => setSecondarySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFormData({ ...formData, secondaryApprover: "none" });
                          setOpenSecondary(false);
                          setSecondarySearch("");
                        }}
                        className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        None
                      </div>
                      {filteredSecondaryUsers.length === 0 && secondarySearch ? (
                        <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No approver found.</div>
                      ) : (
                        filteredSecondaryUsers.map(user => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setFormData({ ...formData, secondaryApprover: user.id.toString() });
                              setOpenSecondary(false);
                              setSecondarySearch("");
                            }}
                            className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {user.name}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="destructive" onClick={onClose} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
