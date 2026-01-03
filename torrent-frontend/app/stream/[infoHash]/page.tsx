import VideoPlayer from "@/app/components/VideoPlayer";
import React, { use } from "react";

const Page = ({ params }: { params: Promise<{ infoHash: string }> }) => {
  const { infoHash } = use(params);

  return (
    <div className="flex h-full justify-center items-center">
      <VideoPlayer source={`http://localhost:5000/stream/${infoHash}`} />
    </div>
  );
};

export default Page;
