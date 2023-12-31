import { AttributeType, BooleanValue, EnumerationLiteralValue, FloatValue, IntegerValue, StringValue, Type, Value, isArrayValue, isBooleanType, isBooleanValue, isEnumerationLiteralValue, isEnumerationType, isFloatType, isFloatValue, isIntegerType, isIntegerValue, isStringType, isStringValue } from "./generated/ast.js";


type TypeValueMapping = {
    typeChecker: (item: unknown) => item is Type
    valueChecker: (item: unknown) => item is Value
    valueType: string
}

const typeValueMapping: TypeValueMapping[] = [
    {
        typeChecker: isBooleanType,
        valueChecker: isBooleanValue,
        valueType: BooleanValue
    },
    {
        typeChecker: isStringType,
        valueChecker: isStringValue,
        valueType: StringValue
    },
    {
        typeChecker: isFloatType,
        valueChecker: isFloatValue,
        valueType: FloatValue
    },
    {
        typeChecker: isIntegerType,
        valueChecker: isIntegerValue,
        valueType: IntegerValue
    },
    {
        typeChecker: isEnumerationType,
        valueChecker: isEnumerationLiteralValue,
        valueType: EnumerationLiteralValue
    }
]

/**
 * Check if the value is of the expected type.
 * @param expectedType the expected type
 * @param value the value to check
 * @returns true if the value is of the expected type, false otherwise
 */
export function checkValueType(expectedType: AttributeType, value: Value): boolean {
    for(const mapping of typeValueMapping) {
        if(mapping.typeChecker(expectedType) && mapping.valueChecker(value)) {
            return true
        }
    }
    return false;
}

/**
 * Check if all the values of an array value are of the expected type.
 * @param expectedType the expected type
 * @param values the array value to check
 * @returns false if the array value is not an array value, an array of the positions of the values that are not of the expected type, undefined otherwise
 */
export function checkArrayValueTypes(expectedType: AttributeType, values: Value): false | number[] | undefined {
    if(isArrayValue(values)) {
      const wrongTypes: number[] = [];
      for (const [pos, value] of values.values.entries()) {
        if(!checkValueType(expectedType, value)) {
          wrongTypes.push(pos);
        }
      }
      return wrongTypes.length > 0 ? wrongTypes : undefined;
    }
    return false;
}

/**
 * Get the value checker for a type.
 * @param type the type to get the corresponding value checker of
 * @returns the value checker, undefined otherwise
 */
export function getValueTypeCheckerFromType(type: Type): ((item: unknown) => item is Value) | undefined {
    for(const mapping of typeValueMapping) {
        if(mapping.typeChecker(type)) {
            return mapping.valueChecker
        }
    }
    return undefined
}

/**
 * Get the value type name fpr a type.
 * @param type the type to get the value type name of
 * @returns the value type name, undefined otherwise
 */
export function getValueTypeNameFromType(type: Type): string | undefined {
    for(const mapping of typeValueMapping) {
        if(mapping.typeChecker(type)) {
            return mapping.valueType
        }
    }
    return undefined
}