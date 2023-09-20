'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import * as z  from "zod";


const formSchema = z.object({
  email: z.string()
    .email({ message: "L'email doit être un email valide" })
    .min(1, { message: "L'email ne peut pas être vide" })
    .max(100, { message: "L'email ne peut pas dépasser 100 caractères" }),
  password: z.string()
    .min(1, { message: "Le mot de passe ne peut pas être vide" })
    .max(100, { message: "Le mot de passe ne peut pas dépasser 100 caractères" }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const LoginForm: React.FC = (): React.ReactNode => {

  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard-user';
 
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:  {
        email: '',
        password:'',
    }
});

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    const authentifier = await signIn('credentials', {
      email: data.email, 
      password: data.password,
      redirect: false
    })
    if (authentifier?.error){
      toast.error('Email ou mot de passe incorrect')
    } else {
      router.refresh()
      router.push(callbackUrl)
    }
    setLoading(false);
  }


  return (
    <>

    <Form {...form}>
            <form onSubmit={form.handleSubmit(() => onSubmit(form.getValues()))} className="space-y-12 w-full sm:w-[400px]">
                
                <div className="grid w-full  items-center gap-1.5">
                    <FormField control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <div className="flex items-start gap-x-4">
                                <Input type="email" autoCapitalize="off" disabled={loading} placeholder="exemple@email.com" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    </div>
                    <div className="grid w-full  items-center gap-1.5">
                    <FormField control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                            <>
                              <div className="flex items-center gap-x-4">
                                <Input disabled={loading} placeholder="*********" {...field} type={showPassword ? "text" : "password"}/>
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  tabIndex={-1} 
                                >
                                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}  
                                </button>
                              </div>
                              <div className="flex">
                                <Link className="mt-2 text-sm text-indigo-500 hover:underline" href={`/reset-password`}> Mot de passe oublié ? </Link>
                              </div>
                            </>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    
                    />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                    Se connecter
                </Button>
                            </form>
        </Form>
        <p className="text-center">{"Vous n'avez pas de compte ?"} <Link className="text-indigo-500 hover:underline" href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}> Crée un compte ici </Link> </p>
      </>
  )
}