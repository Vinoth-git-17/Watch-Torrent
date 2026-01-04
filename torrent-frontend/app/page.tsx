"use client";
import { FormEvent, useRef, useState } from "react";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";
import { Button } from "./components/Button";
import { useSpinner } from "./context/SpinnerProvider";
import Link from "next/link";
import { Input } from "./components/Input";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [details, setDetails] = useState<{
    name: string;
    sizeGB: number;
    infoHash: string;
  }>({
    name: "",
    sizeGB: 0,
    infoHash: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { showSpinner, hideSpinner } = useSpinner();
  const toast = useToast();

  const serverURL = "http://localhost:5000/";

  async function handleSubmit(e: FormEvent<HTMLFormElement> | undefined) {
    e?.preventDefault();
    // Getting link from input value
    const magnetLinkUrl = inputRef.current?.value ?? undefined;
    if (!magnetLinkUrl) {
      alert("Please enter the magnet link");
      return;
    }

    // Back end URL to post the link to process
    const url = serverURL + "add-torrent";

    try {
      showSpinner();
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          magnetURI: magnetLinkUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);

        setDetails(result);
      } else {
        console.error("Failed to send magnet link:", response.statusText);
      }
    } catch (error) {
      toast.toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
      console.error("Error sending magnet link:", error);
    }
    hideSpinner();
  }

  async function handleDownload() {
    // Getting link from input value
    const infoHash = details.infoHash;
    try {
      showSpinner();
      const response = await fetch(serverURL + "download/" + infoHash, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = details.name; // e.g., "movie.mp4"
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
      } else {
        console.error("Failed to Download the file", response.statusText);
      }
    } catch (error) {
      console.error("Error Downloading the file:", error);
    }
    hideSpinner();
  }

  const openInVLC = (infoHash:string) => {
  // Direct VLC network stream URL
  const vlcUrl = `${serverURL}vlc/${infoHash}`;

  // Auto-launch VLC (Windows/Linux)
  window.location.href = `vlc://${vlcUrl}`;
};

  return (
    <div className="min-h-screen bg-[url('/gradient-bg.jpeg')] bg-cover bg-no-repeat bg-center flex flex-col gap-5 items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg rounded-2xl">
        <CardContent>
          {!details.infoHash ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Magnet Link Processor
                </h1>
                <p className="text-sm text-gray-500">
                  Enter a magnet link below to process your request.
                </p>
              </div>

              <Input
                type="text"
                refObject={inputRef}
                placeholder="Enter magnet link here"
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg">
                Process
              </Button>
            </form>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Torrent Details
                </h2>
                <div className="flex flex-col">
                  <strong>Name:</strong> <i>{details.name}</i>
                  <strong>Size:</strong> <i>{details.sizeGB} GB</i>
                </div>
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    className="flex-1 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition duration-150 ease-in-out"
                    onClick={handleDownload}
                  >
                    Download
                  </button>
                  <Link
                    href={`/${details.infoHash}`}
                    className="text-center flex-1 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900 transition duration-150 ease-in-out"
                  >
                    Stream
                  </Link>
                         <button
                    type="button"
                    className="flex-1 text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition duration-150 ease-in-out"
                    onClick={()=>openInVLC(details.infoHash)}
                  >
                    VLC
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
