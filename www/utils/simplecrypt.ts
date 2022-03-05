const key = 'hqkizlJVS2beN8NoXUkv7PzdZEYCu6K2';

export function encrypt(text: string): string {
  return [...new TextEncoder().encode(text)]
    .map((x, i) => x ^ (key.codePointAt(i % key.length) ?? 0))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

export function decrypt(cipherText: string): string {
  return new TextDecoder().decode(
    new Uint8Array(
      (cipherText.match(/.{2}/g)?.map((x) => Number.parseInt(x, 16)) ?? []).map(
        (x, i) => x ^ (key.codePointAt(i % key.length) ?? 0)
      )
    )
  );
}
