export const updateCartQuantity = (items, productId, change) =>
    items
        .map((item) => (
            item.id === productId
                ? { ...item, quantity: item.quantity + change }
                : item
        ))
        .filter((item) => item.quantity > 0);
