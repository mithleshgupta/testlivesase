import ms, { type StringValue } from 'ms';

const parseMs = (value: string) => ms(value as StringValue);

export default parseMs;