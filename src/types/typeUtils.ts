/**
 * Generates a union type from the values of a TypeScript enum.
 *
 * This utility type helps in creating a type representing all possible values
 * of an enum. It dynamically generates a union type based on the enum's values,
 * ensuring the type stays in sync with the enum.
 *
 * @typeparam T - The enum type.
 * @returns A union type of the enum's values.
 *
 * @example
 * enum Color {
 *   Red = 'RED',
 *   Green = 'GREEN',
 *   Blue = 'BLUE'
 * }
 * type ColorValues = EnumValues<Color>; // 'RED' | 'GREEN' | 'BLUE'
 */
export type EnumValues<T> = T[keyof T];
