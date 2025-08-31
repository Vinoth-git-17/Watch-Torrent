import VideoPlayer from '@/app/components/VideoPlayer';
import React from 'react';

const Page = ({ params }: { params: { infoHash: string } }) => {
  const { infoHash } = params;

  return (
    <VideoPlayer source={`http://localhost:5000/stream/${infoHash}`}/>
  );
};

export default Page;