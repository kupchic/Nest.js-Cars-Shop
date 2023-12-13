import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsSameAs(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'IsSameAs',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue: any = (args.object as any)[relatedPropertyName];
          return typeof value === typeof relatedValue && value === relatedValue;
        },
      },
    });
  };
}
