import React from 'react'
import ListItem from '@/components/shared/ListItems'

function LeftSection() {
  const data = [
    {
      desc: "Turn your backend services into profitable APIs with flexible pricing models",
      title: "Monetize Your Code"
    },
    {
      desc: "Deploy directly from GitHub or upload your Dockerfile with one click",
      title: "Seamless Deployment"
    },
    {
      desc: "Your API is automatically deployed to 300+ edge locations worldwide",
      title: "Global CDN"
    },
    {
      desc: "Track usage, revenue, and performance with real-time analytics",
      title: "Detailed Analytics"
    }
  ];

  return (
    <div className='flex flex-col items-stretch'>
      <h1 className="text-2xl md:text-2xl font-extrabold text-black leading-tight">Why Join Blacktree?</h1>
      <span className='text-lg my-5'>
        Join thousands of developers already using BlackTree to monetize and
        deploy their APIs
      </span>
      <div className='space-y-5'>
        {data.map((item, index) => (
          <ListItem
            key={index}
            step={-1}
            description={item.desc}
            title={item.title}
            titleClassName='text-lg'
          />
        ))}
      </div>
    </div>
  );
}

export default LeftSection;
