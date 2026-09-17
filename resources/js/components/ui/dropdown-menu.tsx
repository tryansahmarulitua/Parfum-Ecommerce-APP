import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"

function DropdownMenu({ ...props }: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />
}

function DropdownMenuTrigger({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof Menu.Trigger>) {
  return (
    <Menu.Trigger
      className={cn("outline-none cursor-pointer", className)}
      render={render}
      {...props}
    >
      {children}
    </Menu.Trigger>
  )
}

function DropdownMenuContent({
  className,
  children,
  side = "bottom",
  align = "end",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof Menu.Popup> & {
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <Menu.Popup
          className={cn(
            "min-w-[8rem] overflow-hidden rounded-base border-2 border-border bg-secondary-background p-1 text-foreground shadow-shadow outline-none animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-0.5", className)} {...props} />
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors hover:bg-main hover:text-main-foreground focus:bg-main focus:text-main-foreground data-[highlighted]:bg-main data-[highlighted]:text-main-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
