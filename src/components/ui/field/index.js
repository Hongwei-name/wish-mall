import { cva } from 'class-variance-authority'
export const fieldVariants = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
  variants: { orientation: {
    vertical: 'flex-col [&>*]:w-full [&>.sr-only]:w-auto',
    horizontal: 'flex-row items-center [&>[data-slot=field-label]]:flex-auto',
  } },
  defaultVariants: { orientation: 'vertical' },
})
export { default as Field } from './Field.vue'
export { default as FieldGroup } from './FieldGroup.vue'
export { default as FieldLabel } from './FieldLabel.vue'
export { default as FieldDescription } from './FieldDescription.vue'
