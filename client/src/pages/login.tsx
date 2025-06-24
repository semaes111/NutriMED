import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRound, LogIn } from "lucide-react";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6, "El código debe tener al menos 6 caracteres").max(20, "El código no puede tener más de 20 caracteres"),
});

type AccessCodeForm = z.infer<typeof accessCodeSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      accessCode: "",
    },
  });

  const validateCodeMutation = useMutation({
    mutationFn: async (data: AccessCodeForm) => {
      const response = await apiRequest("POST", "/api/auth/validate", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Acceso concedido",
        description: "Bienvenido a su plan dietético personalizado",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error de acceso",
        description: error.message || "Código de acceso inválido o expirado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccessCodeForm) => {
    validateCodeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          {/* Medical Professional Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-medical-green rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRound className="text-white text-3xl" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Consulta Dietética</h1>
            <p className="text-medical-gray text-sm">Dr. Sergio Martínez Escobar</p>
            <p className="text-xs text-medical-gray mt-1">Facultativo Especialista Medicina Intensiva</p>
          </div>

          {/* Access Code Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Código de Acceso del Paciente
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingrese su código de acceso"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-green focus:border-transparent transition-all duration-200"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Código válido por 30 días</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={validateCodeMutation.isPending}
                className="w-full bg-medical-green text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200"
              >
                <LogIn className="mr-2" size={16} />
                {validateCodeMutation.isPending ? "Validando..." : "Acceder a Mi Dieta"}
              </Button>
            </form>
          </Form>

          {/* Professional Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Dra. Sara Hernández Calpena - Col. 04/4101</p>
              <p>Gda. María Nazaret Aguilera Sánchez - Col. 2341</p>
              <p>Dr. Sergio Martínez Escobar - Col. 04/1809464</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
