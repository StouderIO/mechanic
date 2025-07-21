import { zodResolver } from '@hookform/resolvers/zod'
import { type ComponentProps, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/generated/orval/mechanic/auth-controller/auth-controller.ts'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  adminToken: z.string(),
})

type FormData = z.infer<typeof formSchema>

interface LoginFormProps {
  onLoggedIn: () => void
}

export function LoginForm({
  className,
  onLoggedIn,
  ...props
}: LoginFormProps & ComponentProps<'div'>) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminToken: undefined,
    },
  })

  const { mutate, isPending } = useLogin({
    mutation: {
      onSuccess: () => {
        onLoggedIn()
      },
    },
  })

  const login = useCallback(
    (data: FormData) => {
      mutate({
        data,
      })
    },
    [mutate],
  )

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(login)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Mechanic</h1>
                  <p className="text-muted-foreground text-balance">
                    Your Garage UI
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="adminToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin token</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  Login
                </Button>
              </div>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/mechanic-logo.svg"
              alt="Garage logo"
              className="absolute inset-0 h-full w-full "
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        This is not an official UI for Garage. Mechanic is not affiliated
        neither with Garage neither with the Deuxfleurs association.
      </div>
    </div>
  )
}
