import React from "react";
import { IconButton, Tooltip, TooltipTrigger, TooltipContent } from "@semicoder/fn-sdk/ui";
type Props = Omit<React.ComponentProps<typeof IconButton>, "title">;
export default function ActivityButton(props: Props) {
  const button = <IconButton variant="ghost" {...props} />;
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{props.label}</TooltipContent>
    </Tooltip>
  );
}
