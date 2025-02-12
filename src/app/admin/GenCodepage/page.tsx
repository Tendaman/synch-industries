//src\app\admin\GenCodepage\page.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DatePickerComponent from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function GenCodePage() {
  const [numOfCodes, setNumOfCodes] = useState("");
  const [numOfWinners, setNumOfWinners] = useState("");
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [codes, setCodes] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set()); // Store selected codes
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Manage dialog state
  const [isAssignedDeleteDialogOpen, setIsAssignedDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null); // Store code to delete
  const router = useRouter();

  // Use onChangeAction in the parent component
  const handleDateChangeAction = (date: string | null) => {
    setExpirationDate(date);
  };

  const handleGenerateCodes = async () => {
    setIsLoading(true);
    try {
      // Send request to backend API to generate codes
      const response = await axios.post("/api/admin/generateCodes", {
        numOfCodes: Number(numOfCodes),
        numOfWinners: Number(numOfWinners),
        expirationDate,
      });

      if (response.status === 200) {
        alert("Codes generated successfully!");
        router.push("/admin/GenCodepage");
        fetchCodes();
      } else {
        alert("Failed to generate codes.");
      }
    } catch (error) {
      console.error("Error generating codes:", error);
      alert("Error generating codes.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await axios.get(`/api/admin/generateCodes?filter=${filter}`);
      setCodes(response.data);
    } catch (error) {
      console.error("Error fetching codes:", error);
    }
  };

   // Fetch codes on filter change
  useEffect(() => {
    fetchCodes();
  }, [filter]);

   // Handle individual code selection
   const handleSelectCode = (codeId: string) => {
    setSelectedCodes((prevSelected) => {
      const newSelected = new Set(prevSelected); // Create a copy of the Set
      if (newSelected.has(codeId)) {
        newSelected.delete(codeId); // Remove if already selected
      } else {
        newSelected.add(codeId); // Add if not selected
      }
      return new Set(newSelected); // Return updated Set
    });
  };

  // Handle select all checkbox change
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(new Set(codes.map((code: any) => code.id))); // Select all codes
    } else {
      setSelectedCodes(new Set()); // Deselect all codes
    }
  };

  // Handle delete button click
  const handleDeleteCodes = async () => {
    if (selectedCodes.size === 0) {
      alert("No codes selected for deletion.");
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Convert selectedCodes Set to an array for API call
      const codesToDelete = Array.from(selectedCodes);
  
      // Send a request to unassign and delete the selected codes
      const response = await axios.delete(`/api/admin/deleteCodes`, {
        data: { codesToDelete },
      });

      console.log("Delete response:", response);
  
      if (response.status === 200) {
        alert("Selected codes deleted successfully!");
        setSelectedCodes(new Set()); // Clear the selected codes
        fetchCodes(); // Refresh the list of codes
      } else {
        alert("Failed to delete selected codes.");
      }
    } catch (error) {
      console.error("Error deleting codes:", error);
      alert("Error deleting selected codes.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prevent letters from being entered in the number input fields
  const handleNumInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Allow only digits
      setter(value);
    }
  };

  return (
    <>
      <div className="flex flex-col w-[300px] border p-4 shadow">
        <h1 className="text-3xl font-bold mb-8">Generate codes</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Number of Codes</label>
            <Input
              type="number"
              value={numOfCodes}
              onChange={(e) => handleNumInputChange(e, setNumOfCodes)}
              min={1}
              className="mt-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Number of Winning Codes</label>
            <Input
              type="number"
              value={numOfWinners}
              onChange={(e) => handleNumInputChange(e, setNumOfWinners)}
              min={1}
              max={numOfCodes}
              className="mt-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Expiration Date and Time</label>
            <DatePickerComponent
              selected={expirationDate}
              onChangeAction={handleDateChangeAction} // Updated here
            />
          </div>

          <div className="mt-6">
            <Button onClick={handleGenerateCodes} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Codes"}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Generated Codes</h2>

        <div className="flex">
          {/* Filter Selector */}
          <Select onValueChange={(value: string) => setFilter(value)} defaultValue={filter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Codes</SelectItem>
              <SelectItem value="winning">Winning Codes</SelectItem>
              <SelectItem value="losing">Losing Codes</SelectItem>
              <SelectItem value="assigned">Assigned Codes</SelectItem>
              <SelectItem value="unassigned">Unassigned Codes</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-6 flex items-center">
            {selectedCodes.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedCodes.size === 0) {
                    alert("No codes selected for deletion.");
                    return;
                  }

                  const assignedCode = codes.find((code: any) => selectedCodes.has(code.id) && code.isAssigned);

                  if (assignedCode) {
                    setCodeToDelete(assignedCode);
                    setIsAssignedDeleteDialogOpen(true); // Open assigned code deletion dialog
                  } else {
                    setIsDeleteDialogOpen(true); // Open standard delete dialog
                  }
                }}
              >
                Delete
              </Button>
            )}
            <span className="ml-6 text-xl text-gray-700">
              {selectedCodes.size > 0
                ? `${selectedCodes.size}/${codes.length} codes selected`
                : `${codes.length} codes`}
            </span>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Dialog (Standard) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete the selected code?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDeleteCodes}>Yes, Delete</AlertDialogAction>
          <AlertDialogCancel>No, Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog (Assigned Code) */}
      <AlertDialog open={isAssignedDeleteDialogOpen} onOpenChange={setIsAssignedDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to unassign and delete the selected code?</AlertDialogTitle>
            <AlertDialogDescription>
              This code is assigned to a user. Deleting it will first unassign the code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDeleteCodes}>Yes, Unassign and Delete</AlertDialogAction>
          <AlertDialogCancel>No, Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Codes Table */}
      <Card className="mt-6 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
              <Checkbox
                checked={selectedCodes.size > 0 && selectedCodes.size === codes.length}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              </TableHead>
              <TableHead>Generated Code</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length > 0 ? (
              codes.map((code: any) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCodes.has(code.id)} // Check if the code ID is in the selected array
                      onCheckedChange={() => handleSelectCode(code.id)} // Handle code selection
                    />
                  </TableCell>
                  <TableCell>{code.generatedCode}</TableCell>
                  <TableCell>{code.isWinner ? "✅ Yes" : "❌ No"}</TableCell>
                  <TableCell>{new Date(code.expiresAt).toLocaleString()}</TableCell>
                  <TableCell>{code.isAssigned ? "✅ Yes" : "❌ No"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No codes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}