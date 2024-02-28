"use client";

import GetValideVat from "@/actions/get-valide-vat";
import { AdressForm, FullAdress } from "@/components/adress-form";
import { AlertModal } from "@/components/modals/alert-modal-form";
import { TVAForm } from "@/components/tva-form";
import { Button, LoadingButton } from "@/components/ui/button";
import ButtonBackward from "@/components/ui/button-backward";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { isValidPhoneNumber } from "react-phone-number-input";
import * as z from "zod";

interface UserFormProps {
  initialData: User;
}

const formSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Le numéro de téléphone n'est pas valide",
  }),
  adresse: z.string().min(0),
  tva: z.string().min(0),
  raisonSocial: z.string().min(0),
  isPro: z.boolean(),
});

type UserFormValues = z.infer<typeof formSchema>;

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(!!initialData?.raisonSocial);

  const [selectedAddress, setSelectedAddress] = useState<FullAdress>(
    initialData.adresse
      ? JSON.parse(initialData.adresse)
      : {
          label: "",
          city: "",
          country: "fr",
          line1: "",
          line2: "",
          postalCode: "",
          state: "",
        }
  );

  const title = "Modifier l'utilisateur";
  const description = "Modifier un utilisateur";
  const toastMessage = "Utilisateur mise à jour.";
  const action = "Enregistrer les modifications";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      surname: initialData.surname,
      phone: initialData.phone,
      adresse: selectedAddress.label,
      tva: initialData.tva,
      raisonSocial: initialData.raisonSocial,
      isPro: initialData.isPro,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);

      if (isPro) {
        if (!data.raisonSocial) {
          toast.error(
            "Veuillez renseigner la raison sociale ou passer en particulier."
          );
          return;
        }
        if (data.tva) {
          const valideVat = await GetValideVat(data.tva);
          if (!valideVat) {
            toast.error(
              "Numéro de TVA inconnu, vous pouvez le corriger ou le supprimer pour continuer."
            );
            return;
          }
          data.isPro = Boolean(valideVat);
        }
      } else {
        data.isPro = false;
        data.raisonSocial = "";
      }

      data.name = data.name.trim();
      data.surname = data.surname.trim();
      data.raisonSocial = data.raisonSocial.trim();
      data.adresse = JSON.stringify(selectedAddress);

      await axios.patch(`/api/users/id-admin/${params.userId}`, data);
      router.push(`/admin/users`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        toast.error(axiosError.response.data as string);
      } else {
        toast.error("Something went wrongs.");
      }
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setLoading(true);

      const user = await axios.delete(`/api/users/id-admin/${params.userId}`);
      router.push(`/admin/users`);
      router.refresh();
      toast.success("Utilisateur supprimé");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />

      <p>{initialData?.email}</p>
      <div className="flex mt-6 ">
        <Button
          onClick={(e) => {
            e.preventDefault();
            setIsPro(false);
            form.setValue("tva", "");
          }}
          className={
            !isPro
              ? "selected bg-green-500 ml-3 hover:bg-green-500 text-black"
              : " bg-gray-500 ml-3 hover:bg-green-200  hover:text-black"
          }
        >
          Particulier
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault();
            setIsPro(true);
          }}
          className={
            isPro
              ? "selected bg-green-500 ml-3 hover:bg-green-500 text-black"
              : " bg-gray-500 ml-3 hover:bg-green-200  hover:text-black"
          }
        >
          Professionnel
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numeros de téléphone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="Entrer un numéro de téléphone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AdressForm
              form={form}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />
            {isPro && (
              <>
                <TVAForm
                  form={form}
                  loading={loading}
                  setLoading={setLoading}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                />
                <FormField
                  control={form.control}
                  name="raisonSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raison sociale</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={loading}
                          placeholder="Raison sociale"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <LoadingButton disabled={loading} className="ml-auto" type="submit">
            {action}
          </LoadingButton>
        </form>
      </Form>
      <ButtonBackward />
    </>
  );
};
