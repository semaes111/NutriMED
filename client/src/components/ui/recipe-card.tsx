import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat } from "lucide-react";
import { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <ChefHat className="text-medical-green mr-2" size={20} />
            {recipe.name}
          </CardTitle>
          {recipe.preparationTime && (
            <Badge variant="outline" className="flex items-center">
              <Clock className="mr-1" size={12} />
              {recipe.preparationTime} min
            </Badge>
          )}
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-600">{recipe.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Ingredientes</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Preparación</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-medical-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
