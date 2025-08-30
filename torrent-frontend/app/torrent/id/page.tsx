import { Card } from '@/app/components/Card'
import { CardContent } from '@/app/components/CardContent'
import Link from 'next/link'
import React from 'react'

const page = ({ params }: { params: { id: string } }) => {
  return (
   <>ID : {params.id}</>
  )
}

export default page