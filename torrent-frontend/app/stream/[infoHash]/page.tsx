import VideoPlayer from '@/app/components/VideoPlayer';
import React from 'react';

const Page = ({ params }: { params: { infoHash: string } }) => {
  const { infoHash } = params;

  return (
    <div className='flex h-full justify-center items-center'>
      <VideoPlayer cssClass='rounded-3xl' source={`http://localhost:5000/stream/${infoHash}`}/>
    </div>
  );
};

export default Page;