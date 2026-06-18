import React from "react";
import StandardListingCard from "@/components/listings/StandardListingCard";

// Thin wrapper kept for backwards-compat — delegates to the standardized glass/glow/fire card.
export default function EnhancedListingCard(props) {
  return <StandardListingCard {...props} />;
}