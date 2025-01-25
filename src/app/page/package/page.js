"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, TextInput } from "flowbite-react";
import { toast } from "sonner";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    expiryTime: "",
    description: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages");
      const data = await response.json();
      setPackages(data.data);
    } catch (error) {
      toast.error("Error fetching packages!");
    }
  };

  const handleSubmit = async () => {
    try {
      const method = editingPackage ? "PUT" : "POST";
      const url = "/api/packages"; // URL remains the same for both POST and PUT

      // Structure data for the request
      const requestData = {
        name: formData.name,
        price: formData.price,
        expiryTime: formData.expiryTime,
        description: formData.description,
      };

      if (editingPackage) {
        requestData.id = editingPackage._id; // Include the id in the request body for PUT
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error("Failed to save package");

      toast.success(editingPackage ? "Package updated!" : "Package created!");
      fetchPackages();
      setIsModalOpen(false);
      setFormData({ name: "", price: "", expiryTime: "", description: "" });
      setEditingPackage(null);
    } catch (error) {
      toast.error(error.message || "Error saving package!");
    }
  };

  const handleDelete = async (pkg) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch("/api/packages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg._id }), // Send the package ID in the request body
      });

      if (!response.ok) throw new Error("Failed to delete package");

      toast.success("Package deleted!");
      fetchPackages();
    } catch (error) {
      toast.error("Error deleting package!");
    }
  };

  const openModal = (pkg = null) => {
    setEditingPackage(pkg);
    setFormData(
      pkg
        ? { name: pkg.name, price: pkg.price, expiryTime: pkg.expiryTime, description: pkg.description }
        : { name: "", price: "", expiryTime: "", description: "" }
    );
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <Button onClick={() => openModal()}>Create Package</Button>
      </div>

      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Price</Table.HeadCell>
          <Table.HeadCell>Expiry Time</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {packages.map((pkg) => (
            <Table.Row key={pkg._id}>
              <Table.Cell>{pkg.name}</Table.Cell>
              <Table.Cell>{pkg.price} NPR</Table.Cell>
              <Table.Cell>{pkg.expiryTime} days</Table.Cell>
              <Table.Cell>{pkg.description}</Table.Cell>
              <Table.Cell>
                
                <Button onClick={() => openModal(pkg)} size="xs">
                  Edit
                </Button>
                </Table.Cell>
                <Table.Cell>
                <Button
                  onClick={() => handleDelete(pkg)}
                  size="xs"
                  color="failure"
                  className="ml-2"
                >
                  Delete
                </Button>
                </Table.Cell>
                
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>{editingPackage ? "Edit Package" : "Create Package"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              placeholder="Package Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextInput
              placeholder="Price (NPR)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <TextInput
              placeholder="Expiry Time (days)"
              type="number"
              value={formData.expiryTime}
              onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
            />
            <TextInput
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit}>
            {editingPackage ? "Update Package" : "Create Package"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
