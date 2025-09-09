"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RestaurantDialog from "./restaurant-dialog";
import DeleteRestaurantDialog from "./delete-restaurant-dialog";
import { deleteRestaurant } from "@/lib/actions";
import { toast } from "sonner";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";

interface RestaurantTableProps {
  restaurants: Restaurant[];
}

export default function RestaurantTable({ restaurants }: RestaurantTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setLoading(id);
    const result = await deleteRestaurant(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Restaurant deleted successfully");
    }

    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurants</h2>
        <RestaurantDialog
          trigger={
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          }
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No restaurants found. Add your first restaurant!
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">
                    <div>
                      {restaurant.name || "Unnamed Restaurant"}
                      {restaurant.description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                          {restaurant.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{restaurant.cuisine || "-"}</TableCell>
                  <TableCell>{restaurant.location || "-"}</TableCell>
                  <TableCell>
                    {restaurant.price ? "$".repeat(restaurant.price) : "-"}
                  </TableCell>
                  <TableCell>
                    {restaurant.rating_score
                      ? `${restaurant.rating_score}/5`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <RestaurantDialog
                        restaurant={restaurant}
                        trigger={
                          <Button variant="outline" size="sm">
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DeleteRestaurantDialog
                        restaurantName={restaurant.name || "Unknown"}
                        onConfirm={() => handleDelete(restaurant.id)}
                        isLoading={loading === restaurant.id}
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={loading === restaurant.id}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {restaurants.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {restaurants.length} restaurant
          {restaurants.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
