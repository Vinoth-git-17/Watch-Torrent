import React from 'react';

const Page = ({ params }: { params: { infoHash: string } }) => {
  const { infoHash } = params;

  return (
    <video
      src={`http://localhost:5000/stream/${infoHash}`}
      controls
    />
  );
};

export default Page;