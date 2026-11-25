import test from 'node:test';
import assert from 'node:assert/strict';
import { updateCartQuantity } from '../src/utils/cart.js';

test('increases and decreases cart quantities', () => {
    const cart = [{ id: 'one', name: 'Phone', quantity: 1 }];
    assert.deepEqual(updateCartQuantity(cart, 'one', 1), [
        { id: 'one', name: 'Phone', quantity: 2 }
    ]);
    assert.deepEqual(updateCartQuantity(cart, 'one', -1), []);
});

test('leaves unrelated cart items unchanged', () => {
    const cart = [
        { id: 'one', quantity: 1 },
        { id: 'two', quantity: 3 }
    ];
    assert.deepEqual(updateCartQuantity(cart, 'one', 1), [
        { id: 'one', quantity: 2 },
        { id: 'two', quantity: 3 }
    ]);
});
