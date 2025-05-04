
import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const referenceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  company: z.string().min(2, { message: "Company must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }).or(z.string().length(0)),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  relationship: z.string().optional(),
});

export type Reference = z.infer<typeof referenceSchema>;

const referencesSchema = z.object({
  references: z.array(referenceSchema).min(0).max(5),
});

interface ReferencesFormProps {
  defaultValues?: { references: Reference[] };
  onSubmit: (data: { references: Reference[] }) => void;
  isLoading?: boolean;
}

export default function ReferencesForm({
  defaultValues = { references: [] },
  onSubmit,
  isLoading = false,
}: ReferencesFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<{ references: Reference[] }>({
    resolver: zodResolver(referencesSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "references",
    control: form.control,
  });

  const handleSubmit = (values: { references: Reference[] }) => {
    onSubmit(values);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">References</h3>
              <p className="text-sm text-muted-foreground">
                Add professional references who can vouch for your skills and work ethic
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => 
                append({ 
                  name: "", 
                  position: "", 
                  company: "", 
                  email: "", 
                  phone: "", 
                  relationship: "" 
                })
              }
              disabled={fields.length >= 5}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Reference
            </Button>
          </div>

          {fields.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No references added yet. Click "Add Reference" to add your first reference.
                </p>
              </CardContent>
            </Card>
          )}

          {fields.map((field, index) => (
            <Card key={field.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium">Reference #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`references.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.position`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.company`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="jane.smith@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Former Manager" {...field} />
                        </FormControl>
                        <FormDescription>
                          How you know this person professionally
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-jobmate-600 hover:bg-jobmate-700"
            disabled={isLoading || submitted}
          >
            {isLoading
              ? "Saving..."
              : submitted
              ? "Saved!"
              : "Save References"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
