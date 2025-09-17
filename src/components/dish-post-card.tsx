"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MapPin, Clock, MoreHorizontal, Edit } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditDishDialog from "@/components/edit-dish-dialog";
import CommentSection from "@/components/comment-section";

interface DishPost {
  id: string;
  type: string;
  content: string | null;
  context: string | null;
  created_at: string;
  created_by: string;
  likes_count: number | null;
  comments_count: number | null;
  dish_posts: Array<{
    dishes: {
      id: string;
      name: string;
      description: string | null;
      price: number | null;
      image_url: string | null;
      restaurants: {
        id: string;
        name: string | null;
        location: string | null;
      };
    };
  }>;
  users_with_usernames: {
    user_id: string;
    username: string | null;
    email: string | null;
  } | null;
}

interface DishPostCardProps {
  post: DishPost;
  currentUser?: {
    id: string;
  } | null;
}

export default function DishPostCard({ post, currentUser }: DishPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);

  const dish = post.dish_posts[0]?.dishes;
  const restaurant = dish?.restaurants;
  const user = post.users_with_usernames;

  if (!dish || !restaurant) {
    return null;
  }

  const displayName = user?.username || user?.email?.split('@')[0] || 'Anonymous User';
  const userInitials = user?.username 
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() 
    || post.created_by.slice(0, 2).toUpperCase();

  const canEdit = currentUser && currentUser.id === post.created_by;

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContextColor = (context: string | null) => {
    switch (context) {
      case 'tourist':
        return 'bg-blue-100 text-blue-800';
      case 'local':
        return 'bg-green-100 text-green-800';
      case 'date':
        return 'bg-pink-100 text-pink-800';
      case 'family':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-gray-100 text-gray-800';
      case 'celebration':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">@{displayName}</p>
              {post.context && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${getContextColor(post.context)}`}
                >
                  {post.context}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(post.created_at)}
            </div>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditDishDialog
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Dish
                    </DropdownMenuItem>
                  }
                  dish={{
                    id: dish.id,
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    image_url: dish.image_url,
                  }}
                  postId={post.id}
                  postContent={post.content}
                  onSuccess={() => {
                    // Optionally trigger a refresh or update
                    window.location.reload();
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Dish Image */}
        {dish.image_url && (
          <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
            <Image
              src={dish.image_url}
              alt={`${dish.name} dish from ${restaurant.name} restaurant`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Dish Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{dish.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {restaurant.name} · {restaurant.location}
                </span>
              </div>
            </div>
            {dish.price && (
              <div className="flex items-center text-sm font-medium flex-shrink-0">
                {formatPrice(dish.price)}
              </div>
            )}
          </div>

          {dish.description && (
            <p className="text-sm text-muted-foreground">{dish.description}</p>
          )}

          {post.content && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">{post.content}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                liked ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
              />
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1 ${
                showComments ? 'text-blue-600' : 'text-muted-foreground'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </Button>
          </div>
        </div>
      </CardFooter>
      
      {/* Comments Section */}
      {showComments && (
        <CardContent className="pt-0 border-t">
          <CommentSection postId={post.id} currentUser={currentUser} />
        </CardContent>
      )}
    </Card>
  );
}