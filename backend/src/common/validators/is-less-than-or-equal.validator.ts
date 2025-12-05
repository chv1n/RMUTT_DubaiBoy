import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isLessThanOrEqual', async: false })
export class IsLessThanOrEqualConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];

        // If either value is not a number (or undefined/null), we skip this validation 
        // (let IsNumber or IsOptional handle type checks)
        if (typeof value !== 'number' || typeof relatedValue !== 'number') {
            return true;
        }

        return value <= relatedValue;
    }

    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${args.property} must be less than or equal to ${relatedPropertyName}`;
    }
}

export function IsLessThanOrEqual(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsLessThanOrEqualConstraint,
        });
    };
}
