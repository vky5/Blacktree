import React from 'react'
import ListItem from '@/components/shared/ListItems'

function LeftSection() {
  return (
    <div>
        <h1>Why Join Blacktree?</h1>
        <span>
          Join thousands of developers already using BlackTree to monetize and
          deploy their APIs
        </span>
        <div>
          <ListItem
            step={1}
            description="Turn your backend services into profitable APIs with flexible pricing models"
            title="Monetize Your Code"
          />
        </div>
    </div>
  )
}

export default LeftSection;
