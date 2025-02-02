
"use client"
import { useRef, useState } from "react";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";
import { Input } from "./components/Input";
import { Button } from "./components/Button";

export default function Home() {
  const [details, setDetails] = useState<{name : string, size: number, videoURL : string}>({
    name: "",
    size: 0,
    videoURL: "",
  });
  const inputRef = useRef<HTMLInputElement>(null)

   async function handleSubmit(e:any) {
    e.preventDefault();
    
    // Getting link from input value
    const magnetLinkUrl = inputRef.current?.value ?? undefined;
    
    if(!magnetLinkUrl){
      alert("Please enter the magnet link")
      return;
    }
   
     // Back end URL to post the link to process
     const url = "http://localhost:5000/add-torrent"; 

     try {
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
         
         setDetails(result)
       } else {
         console.error("Failed to send magnet link:", response.statusText);
       }
     } catch (error) {
       console.error("Error sending magnet link:", error);

     }

      // Clear the input field value
      if(inputRef.current)
        inputRef.current.value = ""

   
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex flex-col gap-5 items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg rounded-2xl">
        <CardContent>
          <div
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-800">Magnet Link Processor</h1>
            <p className="text-sm text-gray-500">
              Enter a magnet link below to process your request.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              type="text"
              refObject={inputRef}
              placeholder="Enter magnet link here"
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg" >
              Process
            </Button>
          </form>
        </CardContent>
      </Card>
      {details.videoURL &&<Card>
        <CardContent>
           <h1> Name : <i>{details.name}</i></h1>
            <video id="torrent-video-player" controls src={details.videoURL}></video>
        </CardContent>
      </Card>}
    </div>
  );
}
