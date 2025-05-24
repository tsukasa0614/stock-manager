declare module '@/components/ui/dialog' {
  import * as React from 'react';
  import * as DialogPrimitive from '@radix-ui/react-dialog';

  export const Dialog: typeof DialogPrimitive.Root;
  export const DialogContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & React.RefAttributes<HTMLDivElement>
  >;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & React.RefAttributes<HTMLHeadingElement>
  >;
  export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/input' {
  import * as React from 'react';

  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

  export const Input: React.ForwardRefExoticComponent<
    InputProps & React.RefAttributes<HTMLInputElement>
  >;
}

declare module '@/components/ui/label' {
  import * as React from 'react';
  import * as LabelPrimitive from '@radix-ui/react-label';

  export const Label: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module '@/components/ui/select' {
  import * as React from 'react';
  import * as SelectPrimitive from '@radix-ui/react-select';

  export const Select: typeof SelectPrimitive.Root;
  export const SelectContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectItem: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectTrigger: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & React.RefAttributes<HTMLButtonElement>
  >;
  export const SelectValue: typeof SelectPrimitive.Value;
} 