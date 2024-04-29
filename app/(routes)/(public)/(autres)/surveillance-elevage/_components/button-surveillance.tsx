"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ScrollToForm } from "./scroll-to-target";

const ButtonSurveillance = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="grid max-w-4xl grid-cols-1  items-center justify-center gap-10 p-6 md:grid-cols-2">
        <CardSurveillance
          title="Surveillance de stabulation, robots de traite, vêlages, poulinages, poulaillers…"
          content={
            <>
              {" "}
              <p>
                {
                  "Avec notre caméra 360°, zoom X25 et vision nocturne 100m ! Pilotez à distance la camera 360° aux 4 coins de votre bâtiment, avec cette camera, vous ne raterez aucuns détails !"
                }
              </p>
              <Button asChild variant={"link"} className="text-lg font-bold">
                <Link href="/demo-cam">Voir en LIVE</Link>
              </Button>
            </>
          }
          image="/surveillance-elevage/camera_surveillance2.webp"
        />
        <CardSurveillance
          title="Surveillance sécurité aux abords et à l’intérieur des bâtiments"
          content={
            <>
              {" "}
              <p>
                {
                  " En optant pour nos caméras fix grand angle, couplé avec un enregistreur, vous ne raterez aucunes intrusions ou mouvement suspect, vous pouvez même choisir d’être alerté en direct sur votre smartphone          en cas d’intrusion ou d’anomalie."
                }
              </p>
            </>
          }
          image="/surveillance-elevage/camera_surveillance1.webp"
        />
      </div>
    </div>
  );
};

export default ButtonSurveillance;

const CardSurveillance = ({
  title,
  content,
  image,
}: {
  title: string;
  content: React.ReactNode;
  image: string;
}) => {
  return (
    <Card className="relative flex h-full max-w-md flex-col justify-between">
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-center text-xl font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative  text-center">{content}</CardContent>
      <div className="group  relative mx-auto size-20">
        <Image
          src={image}
          alt="image"
          fill
          sizes="160px"
          className=" pointer-events-none z-10 object-contain opacity-100 transition-transform group-hover:scale-[2]"
        />
      </div>
      <CardFooter className="relative flex items-center justify-center">
        {" "}
        <ScrollToForm text="Parlez nous de votre projet" />
      </CardFooter>
    </Card>
  );
};