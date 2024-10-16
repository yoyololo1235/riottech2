"use client";
import { addDelay, checkIfUrlAccessible } from "@/lib/utils";
import type { _Object } from "@aws-sdk/client-s3";
import { AnimatePresence, Reorder } from "framer-motion";
import { Loader2, Plus, Trash, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimateHeight } from "../animations/animate-size";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { deleteObject, getSignature, listFiles } from "./server";

const bucketName = process.env.NEXT_PUBLIC_SCALEWAY_BUCKET_NAME as string;

type UploadImageProps = {
  selectedFiles: string[];
  setSelectedFiles: Dispatch<SetStateAction<string[]>>;
  multipleImages?: boolean;
};

const UploadImage = ({ selectedFiles, setSelectedFiles, multipleImages = false }: UploadImageProps) => {
  const [files, setFiles] = useState<_Object[]>([]);

  const [loading, setLoading] = useState(false);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const files: File[] = [];
    for (const file of event.target.files) {
      files.push(file);
    }

    await fileChange(files);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setLoading(true);
    const files: File[] = [];
    for (const file of event.dataTransfer.files) {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/jpg" &&
        file.type !== "image/webp"
      ) {
        toast.error(
          `Le format du fichier n'est pas supporté : ${file.name}\nFormats supportés : png, jpeg, jpg, webp`,
          { duration: 5000 },
        );
      } else {
        files.push(file);
      }
    }

    await fileChange(files);
  };

  const fileChange = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      console.log(file.type);
      const originalFileName = file.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
      const randomString = generateRandomString(10);
      const uniqueFileName = `${randomString}-${fileNameWithoutExtension.replace(/\s/g, "")}`;
      const result = await getSignature({
        fileName: uniqueFileName,
        contentType: file.type,
      });
      if (!result.success) {
        toast.error(result.message);
        return null;
      }

      const { preSignedUrl } = result.data;

      const response = await fetch(preSignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "x-amz-acl": "public-read",
        },
        cache: "no-store",
      });

      return uniqueFileName;
    });

    const results = await Promise.all(uploadPromises);

    const validUrls = results.map((key) => `https://${bucketName}.s3.fr-par.scw.cloud/${key}`);

    await checkUrls(validUrls);

    const updatedFiles = await listFiles();
    if (!updatedFiles.success) {
      toast.error(updatedFiles.message);
      setLoading(false);
      return;
    }
    setFiles(updatedFiles.data);
    if (multipleImages) {
      setSelectedFiles((prev) => [...prev, ...results.filter((item): item is string => item !== null)]);
    } else {
      setSelectedFiles([results[0] ?? ""]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await listFiles();
      if (!files.success) {
        return;
      }
      setFiles(files.data);
    };
    fetchFiles();
  }, []);

  return (
    <div className="justify-left flex flex-col gap-4 p-4">
      <div
        className="justify-left flex items-center gap-4"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <label
          htmlFor="image-input"
          className="relative flex w-fit cursor-pointer flex-col items-center justify-center  rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 
         "
        >
          <div
            data-state={loading}
            className="absolute right-1/2 top-1/2 hidden -translate-y-1/2 translate-x-1/2 data-[state=true]:block "
          >
            <Loader2 className="animate-spin" />
          </div>

          <div data-state={loading} className=" text-center data-[state=true]:blur-md">
            <div className=" mx-auto max-w-min rounded-md border bg-foreground p-2">
              <UploadCloud size={20} className="text-primary-foreground" />
            </div>

            <p className="mt-2 text-sm text-primary">
              <span className="font-semibold">{multipleImages ? "Ajouter des images" : "Ajouter une image"}</span>
            </p>
          </div>
          <Input
            id="image-input"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            type="file"
            className="hidden"
            onChange={handleFile}
            multiple={multipleImages}
          />
        </label>
        {/* <LoadingButton
          className=" w-fit "
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            const files = await listFiles(bucketName);
            console.log(bucketName);
            if (!files) {
              return;
            }

            setFiles(files);
            setLoading(false);
          }}
        >
          Rechercher les images
        </LoadingButton> */}
      </div>

      <DisplaySelectedImages
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        multipleImages={multipleImages}
      />

      <DisplayImages
        files={files}
        setFiles={setFiles}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        multipleImages={multipleImages}
        setLoading={setLoading}
      />
    </div>
  );
};

export default UploadImage;

type DisplaySelectedImagesProps = {
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  multipleImages: boolean;
};

const DisplaySelectedImages = ({ selectedFiles, setSelectedFiles, multipleImages }: DisplaySelectedImagesProps) => {
  return (
    <>
      {selectedFiles.length !== 0 && (
        <div>
          <h1 className="text-primary"> {multipleImages ? "Images selectionnées" : "Image selectionnée"}</h1>
          <Reorder.Group
            as="ul"
            values={selectedFiles}
            onReorder={setSelectedFiles}
            layoutScroll
            className="flex max-w-[1000px] flex-row gap-4 overflow-x-scroll p-2 hide-scrollbar"
            axis="x"
          >
            <AnimatePresence>
              {selectedFiles.map((key) => (
                <Reorder.Item
                  key={key}
                  value={key}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100px" }}
                  exit={{ opacity: 0, width: 0 }}
                  as="li"
                  className="group relative aspect-square h-[100px] cursor-pointer   rounded-xl bg-transparent hover:ring-2"
                >
                  <Image
                    src={`https://${bucketName}.s3.fr-par.scw.cloud/${key}`}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100px, (max-width: 1200px) 100px, 100px"
                    className="pointer-events-none rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFiles((prev) => prev.filter((item) => item !== key));
                    }}
                    className="absolute right-0 z-10 hidden items-center justify-center  rounded-tr-md bg-destructive px-2 text-destructive-foreground transition-all hover:bg-destructive/90 group-hover:flex"
                  >
                    <X size={20} />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
    </>
  );
};

type DisplayImagesProps = {
  files: _Object[];
  setFiles: React.Dispatch<React.SetStateAction<_Object[]>>;
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  multipleImages: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const DisplayImages = ({
  files,
  setFiles,
  selectedFiles,
  setSelectedFiles,
  multipleImages,
  setLoading,
}: DisplayImagesProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 10;
  const [displayFiles, setDisplayFiles] = useState(false);
  const [search, setSearch] = useState("");

  const onDelete = async (key: string | undefined) => {
    if (!key) {
      toast.error("key not found");
      return;
    }
    const deleted = await deleteObject({
      bucketName,
      key,
    });

    if (deleted.success) {
      setFiles((prev) => prev.filter((file) => file.Key !== key));
      setSelectedFiles((prev) => prev.filter((file) => file !== key));
      toast.success("Image supprimée");
    } else {
      toast.error(deleted.error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="my-2 mt-6 text-sm font-medium text-primary">Images disponibles</p>
      <Switch
        onCheckedChange={() => {
          setDisplayFiles(!displayFiles);
        }}
        checked={displayFiles}
      />
      <AnimateHeight display={displayFiles} className="space-y-4 p-1">
        <Input onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher" className="w-fit " />
        <div
          className="flex max-w-[1000px] flex-row flex-wrap gap-4 whitespace-nowrap
            p-2 "
        >
          {files.length > 0 ? (
            files
              .filter(
                (file) =>
                  !selectedFiles.includes(file.Key ?? "") && file.Key?.toLowerCase().includes(search.toLowerCase()),
              )
              .slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage)
              .map((file) => (
                <div
                  key={file.Key}
                  className="justify-left group relative flex gap-2 overflow-hidden rounded-lg  border border-slate-100 pr-2 transition-all hover:border-slate-300"
                >
                  <div className="flex  w-fit flex-1  items-center p-2">
                    <div className="relative aspect-square h-10 rounded-xl text-white">
                      <Image
                        src={`https://${bucketName}.s3.fr-par.scw.cloud/${file.Key}`}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 40px, (max-width: 1200px) 40px, 40px"
                        className="object-cover"
                      />
                    </div>
                    <div
                      className="ml-2
                     w-fit space-y-1"
                    >
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground ">{file.Key?.slice(11)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      await onDelete(file.Key);
                      setLoading(false);
                    }}
                    className="absolute right-0 hidden items-center justify-center  rounded-tr-md bg-destructive px-2 py-1 text-destructive-foreground transition-all hover:bg-destructive/90 group-hover:flex"
                  >
                    <Trash size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (multipleImages) {
                        setSelectedFiles((prev) => [...prev, file.Key ?? ""]);
                      } else {
                        setSelectedFiles([file.Key ?? ""]);
                      }
                    }}
                    className="absolute left-0 hidden items-center justify-center  rounded-tl-md bg-green-800 px-2 py-1 text-green-50 transition-all hover:bg-green-800/90 group-hover:flex"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              ))
          ) : (
            <Loader2 className="m-4 h-8 w-8 animate-spin" />
          )}
        </div>
        <div className="flex items-center justify-start space-x-2 ">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((prev) => prev - 1);
            }}
            disabled={currentPage === 1}
          >
            Précedent
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((prev) => prev + 1);
            }}
            disabled={currentPage * imagesPerPage >= files.length - selectedFiles.length}
          >
            Suivant
          </Button>
        </div>
      </AnimateHeight>
    </div>
  );
};

const checkUrls = async (urls: (string | null)[]): Promise<void> => {
  const invalidUrls = await Promise.all(
    urls.map(async (url) => {
      if (!url) {
        return null;
      }
      const isAccessible = await checkIfUrlAccessible(url);
      return isAccessible ? null : url;
    }),
  );

  if (invalidUrls.some((url) => url !== null)) {
    // If there are still invalid URLs, wait for 250ms and check again
    await addDelay(500);
    return checkUrls(invalidUrls.filter((url) => url !== null));
  }
  return;
};

const generateRandomString = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
