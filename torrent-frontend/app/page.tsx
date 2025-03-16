"use client";
import { useRef, useState } from "react";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { useSpinner } from "./context/SpinnerProvider";
import Stream from "./stream/page";
import Link from "next/link";

export default function Home() {
  const [details, setDetails] = useState<{
    name: string;
    size: number;
    infoHash: string;
  }>({
    name: "",
    size: 0,
    infoHash: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { showSpinner, hideSpinner } = useSpinner();

  const serverURL = "http://localhost:5000/"
    // Getting link from input value
 const magnetLinkUrl = inputRef.current?.value ?? undefined;

  async function handleSubmit(e: any) {
    e.preventDefault();



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
      console.error("Error sending magnet link:", error);
    }
    hideSpinner();

    // Clear the input field value
    if (inputRef.current) inputRef.current.value = "";
  }

 async function handleDownload() {
    try {
      showSpinner();
      const response = await fetch(serverURL + "download-torrent", {
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

       
      } else {
        console.error("Failed to Download the file", response.statusText);
      }
    } catch (error) {
      console.error("Error Downloading the file:", error);
    }
    hideSpinner();

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex flex-col gap-5 items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg rounded-2xl">
        <CardContent>
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
        </CardContent>
      </Card>
      {/* {details.infoHash && ( */}
        <Card className="max-w-md w-full shadow-lg rounded-2xl bg-white p-6 mt-6">
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Torrent Details
            </h2>
            <p className="text-gray-700">
              <strong>Name:</strong> <i>{details.name}</i>
            </p>
            <div className="flex justify-between gap-4">
              <button
                type="button"
                className="flex-1 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition duration-150 ease-in-out"
                onClick={handleDownload}
              >
                Download
              </button>
              <Link
                href={`/stream/${details.infoHash}`}
                className="text-center flex-1 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900 transition duration-150 ease-in-out"
              >
                Stream
              </Link>
            </div>
          </CardContent>
        </Card>
      {/* )} */}
      
    </div>
  );
}
