# API Reference

This document lists all public APIs, components, hooks, and utilities exposed by this project. Imports assume the `@` path alias resolves to `src/`.

- Components are React components unless noted.
- UI components are built on Radix primitives and TailwindCSS.
- All components accept a `className` prop for styling unless otherwise specified.

## Table of Contents

- Hooks
  - useToast
  - useIsMobile
- Utilities
  - cn
- App Components
  - Toaster (Radix-based)
  - Toaster (Sonner)
  - Navigation
  - Chart primitives
  - Sidebar system
- UI Components
  - Accordion
  - Alert
  - Alert Dialog
  - Aspect Ratio
  - Avatar
  - Badge
  - Breadcrumb
  - Button
  - Calendar
  - Card
  - Carousel
  - Chart (container, tooltip, legend)
  - Checkbox
  - Collapsible
  - Command
  - Context Menu
  - Dialog
  - Drawer
  - Dropdown Menu
  - Form helpers
  - Hover Card
  - Input
  - Input OTP
  - Label
  - Menubar
  - Navigation Menu
  - Pagination
  - Popover
  - Progress
  - Radio Group
  - Resizable
  - Scroll Area
  - Select
  - Separator
  - Sheet
  - Sidebar (see App Components)
  - Skeleton
  - Slider
  - Switch
  - Table
  - Tabs
  - Textarea
  - Toast primitives
  - Tooltip
  - Toaster (wrapper)

---

## Hooks

### useToast

Import: `import { useToast, toast } from "@/components/ui/use-toast"`

- `useToast()` returns `{ toasts, toast, dismiss }` for Radix-based toasts.
- `toast({ title?, description?, action?, ...props })` creates a toast and returns `{ id, dismiss, update }`.
- `dismiss(id?)` dismisses one or all toasts.

Example:
```tsx
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

function Demo() {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast({ title: "Saved", description: "Your changes were saved." })}>
        Show toast
      </button>
      <Toaster />
    </>
  );
}
```

Also available: Sonner variant `import { Toaster as Sonner, toast as sonnerToast } from "@/components/ui/sonner"`.

### useIsMobile

Import: `import { useIsMobile } from "@/hooks/use-mobile"`

- Returns `boolean` reflecting `(max-width: 767px)`.

Example:
```tsx
import { useIsMobile } from "@/hooks/use-mobile";

function Responsive() {
  const isMobile = useIsMobile();
  return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
}
```

---

## Utilities

### cn

Import: `import { cn } from "@/lib/utils"`

- Merges class names using `clsx` and `tailwind-merge`.

Example:
```tsx
<div className={cn("p-2", isActive && "bg-primary")}/>
```

---

## App Components

### Toaster (Radix)

Import: `import { Toaster } from "@/components/ui/toaster"`

- Renders Radix ToastProvider and active toasts from `useToast()`.
- Place once near app root.

Example:
```tsx
import { Toaster } from "@/components/ui/toaster";

export function AppRoot() {
  return <Toaster />;
}
```

### Toaster (Sonner)

Import: `import { Toaster as Sonner, toast } from "@/components/ui/sonner"`

- Wrapper over `sonner` with theme support.

Example:
```tsx
import { Toaster as Sonner, toast } from "@/components/ui/sonner";

function Demo() {
  return (
    <>
      <button onClick={() => toast("Hello")}>Notify</button>
      <Sonner />
    </>
  );
}
```

### Navigation

Import: `import { Navigation } from "@/components/Navigation"`

- Top navigation bar using `react-router-dom` and `Button`.

Example:
```tsx
import { Navigation } from "@/components/Navigation";

function Layout() {
  return (
    <>
      <Navigation />
      {/* page content */}
    </>
  );
}
```

### Chart primitives

Import: `import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"`

- `ChartContainer`: Provides CSS variables and context for Recharts.
  - Props: `config: ChartConfig`, children: a `ResponsiveContainer` child.
- `ChartTooltip`, `ChartLegend`: Re-exported primitives.
- `ChartTooltipContent`, `ChartLegendContent`: Styled wrappers.

Example:
```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";

const config = { visitors: { label: "Visitors", color: "hsl(var(--primary))" } };

function ChartDemo({ data }: { data: Array<{ date: string; visitors: number }> }) {
  return (
    <ChartContainer config={config}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" />
      </LineChart>
    </ChartContainer>
  );
}
```

### Sidebar system

Import: `import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarRail, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarGroupAction, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarInput, useSidebar } from "@/components/ui/sidebar"`

- Responsive sidebar with desktop and mobile behavior.
- Control with `useSidebar()` or `SidebarTrigger`.

Example:
```tsx
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton
} from "@/components/ui/sidebar";

function AppShell() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Header</SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">
          <SidebarTrigger />
          Content
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## UI Components

Below are common exports and usage snippets. Many components are thin wrappers around Radix primitives and accept the same props with added styling.

### Accordion

Import: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`

Example:
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Alert

Import: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"`

```tsx
<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Something happened.</AlertDescription>
</Alert>
```

### Alert Dialog

Import: `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"`

```tsx
<AlertDialog>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Aspect Ratio

Import: `import { AspectRatio } from "@/components/ui/aspect-ratio"`

```tsx
<AspectRatio ratio={16/9}>
  <img src="..." />
</AspectRatio>
```

### Avatar

Import: `import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"`

```tsx
<Avatar>
  <AvatarImage src="/user.png" />
  <AvatarFallback>U</AvatarFallback>
</Avatar>
```

### Badge

Import: `import { Badge } from "@/components/ui/badge"`

```tsx
<Badge>New</Badge>
```

### Breadcrumb

Import: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb"`

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Dashboard</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Button

Import: `import { Button } from "@/components/ui/button"`

- Variants: `default | destructive | outline | secondary | ghost | link | hero | success | glass`
- Sizes: `default | sm | lg | xl | icon`

```tsx
<Button variant="secondary" size="lg">Click</Button>
```

### Calendar

Import: `import { Calendar } from "@/components/ui/calendar"`

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
```

### Card

Import: `import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Desc</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Carousel

Import: `import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"`

```tsx
<Carousel>
  <CarouselContent>
    <CarouselItem>1</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### Chart

See App Components → Chart primitives

### Checkbox

Import: `import { Checkbox } from "@/components/ui/checkbox"`

```tsx
<Checkbox checked={checked} onCheckedChange={setChecked} />
```

### Collapsible

Import: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`

```tsx
<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Hidden</CollapsibleContent>
</Collapsible>
```

### Command

Import: `import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "@/components/ui/command"`

```tsx
<Command>
  <CommandInput placeholder="Search" />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="Group">
      <CommandItem>Item</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### Context Menu

Import: `import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu"`

```tsx
<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Dialog

Import: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"`

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Desc</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Drawer

Import: `import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer"`

```tsx
<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
    </DrawerHeader>
  </DrawerContent>
</Drawer>
```

### Dropdown Menu

Import: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuShortcut, DropdownMenuRadioGroup } from "@/components/ui/dropdown-menu"`

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Form helpers

Import: `import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField } from "@/components/ui/form"`

```tsx
<Form /* from react-hook-form */ >
  <FormField name="email" /* control, render */ />
</Form>
```

### Hover Card

Import: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"`

```tsx
<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>Details</HoverCardContent>
</HoverCard>
```

### Input

Import: `import { Input } from "@/components/ui/input"`

```tsx
<Input placeholder="Email" />
```

### Input OTP

Import: `import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"`

```tsx
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
  </InputOTPGroup>
</InputOTP>
```

### Label

Import: `import { Label } from "@/components/ui/label"`

```tsx
<Label htmlFor="email">Email</Label>
```

### Menubar

Import: `import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar"`

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### Navigation Menu

Import: `import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"`

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
      <NavigationMenuContent>...</NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Pagination

Import: `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"`

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>1</PaginationLink>
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Popover

Import: `import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"`

```tsx
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

### Progress

Import: `import { Progress } from "@/components/ui/progress"`

```tsx
<Progress value={42} />
```

### Radio Group

Import: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`

```tsx
<RadioGroup>
  <RadioGroupItem value="a" />
</RadioGroup>
```

### Resizable

Import: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"`

```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={50} />
  <ResizableHandle />
  <ResizablePanel defaultSize={50} />
</ResizablePanelGroup>
```

### Scroll Area

Import: `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`

```tsx
<ScrollArea className="h-72">
  <div>Content</div>
  <ScrollBar orientation="vertical" />
</ScrollArea>
```

### Select

Import: `import { Select, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup, SelectValue } from "@/components/ui/select"`

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">A</SelectItem>
  </SelectContent>
</Select>
```

### Separator

Import: `import { Separator } from "@/components/ui/separator"`

```tsx
<Separator />
```

### Sheet

Import: `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"`

```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Details</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### Skeleton

Import: `import { Skeleton } from "@/components/ui/skeleton"`

```tsx
<Skeleton className="h-6 w-24" />
```

### Slider

Import: `import { Slider } from "@/components/ui/slider"`

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

### Switch

Import: `import { Switch } from "@/components/ui/switch"`

```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Table

Import: `import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table"`

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Jane</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs

Import: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
</Tabs>
```

### Textarea

Import: `import { Textarea } from "@/components/ui/textarea"`

```tsx
<Textarea placeholder="Your message" />
```

### Toast primitives

Import: `import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@/components/ui/toast"`

```tsx
<ToastProvider>
  <Toast>
    <ToastTitle>Title</ToastTitle>
    <ToastDescription>Desc</ToastDescription>
    <ToastClose />
  </Toast>
  <ToastViewport />
</ToastProvider>
```

### Tooltip

Import: `import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"`

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tip</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Pages

These are route components exported as default: `Index`, `Auth`, `Dashboard`, `Planner`, `Statistics`, `Simulados`, `Review`, `Profile`, `NotFound`.

Usage with React Router is shown in `src/App.tsx`.
