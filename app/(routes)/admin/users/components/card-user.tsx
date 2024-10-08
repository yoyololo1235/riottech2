"use client";
import { AlertModal } from "@/components/modals/alert-modal-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User } from "@prisma/client";
import ky, { type HTTPError } from "ky";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CardUserProps {
  user: User;
  orderLength: number;
  subscriptionOrderLength: number;
  className?: string;
}

const CardUser: React.FC<CardUserProps> = ({ user, orderLength, subscriptionOrderLength, className }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await ky.delete(`/api/users/id-admin/${user.id}`);
      router.refresh();
      toast.success("Utilisateur supprimé");
    } catch (error) {
      const kyError = error as HTTPError;
      if (kyError.response) {
        const errorData = await kyError.response.text();
        toast.error(errorData);
      } else {
        toast.error("Erreur.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={handleDelete} loading={loading} />

      <Card className={cn("flex h-full w-full min-w-[300px] flex-col justify-between", className)}>
        <CardHeader>
          <CardTitle
            onClick={() => {
              router.push(`/admin/users/${user.id}`);
              router.refresh();
            }}
            className="cursor-pointer hover:underline"
          >
            {user.raisonSocial ? (
              <>
                <span className="capitalize">{user.raisonSocial}</span>
                <br />
                {"("}
                <span className="capitalize">{user.name}</span> <span className="capitalize">{user.surname}</span>
                {")"}
              </>
            ) : (
              <>
                <span className="capitalize">{user.name}</span> <span className="capitalize">{user.surname}</span>
              </>
            )}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="p-2">{user.raisonSocial ? "Professionnel" : "Particulier"}</p>
          <p className="p-2">{`Nombre de commandes : ${orderLength}`}</p>
          <p className="p-2">{`Nombre d'abonnements : ${subscriptionOrderLength}`}</p>
        </CardContent>
        <CardFooter className="flex flex-row items-end justify-between  gap-2">
          <Button variant="destructive" onClick={() => setOpen(true)} className="hover:underline">
            Supprimer
          </Button>
          <Button className="hover:underline">
            <Link href={`/admin/users/${user.id}`}>Modifier</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default CardUser;
