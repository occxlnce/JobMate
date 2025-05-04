
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  description: string;
  price: {
    monthly: string;
    annually: string;
  };
  features: string[];
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    description: "Basic features to help you get started",
    price: {
      monthly: "R0",
      annually: "R0",
    },
    features: [
      "Create up to 3 CVs",
      "Basic job recommendations",
      "Limited interview practice",
      "Email support",
    ],
  },
  {
    name: "Premium",
    description: "Everything you need for your job search",
    price: {
      monthly: "R59",
      annually: "R299",
    },
    features: [
      "Unlimited CVs and cover letters",
      "Advanced job matching algorithm",
      "Unlimited interview practice",
      "Priority support",
      "AI resume optimization",
      "Personalized career coaching",
      "Advanced analytics and insights",
    ],
    highlighted: true,
  }
];

export function PricingPlans({ 
  billingInterval = "monthly" 
}: { 
  billingInterval?: "monthly" | "annually" 
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "flex flex-col",
              plan.highlighted && "border-jobmate-600 shadow-lg"
            )}
          >
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {billingInterval === "monthly" ? plan.price.monthly : plan.price.annually}
                </span>
                <span className="text-muted-foreground ml-1">
                  /{billingInterval === "monthly" ? "month" : "year"}
                </span>
                {billingInterval === "annually" && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Save {Math.round((12 * parseInt(plan.price.monthly.substring(1)) - parseInt(plan.price.annually.substring(1))) / (12 * parseInt(plan.price.monthly.substring(1))) * 100)}%
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={cn(
                  "w-full",
                  plan.highlighted ? "bg-jobmate-600 hover:bg-jobmate-700" : ""
                )}
              >
                {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
