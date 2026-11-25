const getValidatedProductFields = (body = {}) => {
    const { name, description = '', category, price, inventory } = body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const numericPrice = Number(price);
    const numericInventory = Number(inventory);

    if (!trimmedName || trimmedName.length > 120 || trimmedDescription.length > 2000 ||
        !trimmedCategory || trimmedCategory.length > 60 || !Number.isFinite(numericPrice) ||
        numericPrice <= 0 || numericPrice > 1000000000 ||
        !Number.isInteger(numericPrice) || !Number.isInteger(numericInventory) ||
        numericInventory < 0 || numericInventory > 1000000000) {
        return null;
    }

    return {
        name: trimmedName,
        description: trimmedDescription,
        category: trimmedCategory,
        price: numericPrice,
        inventory: numericInventory
    };
};

module.exports = getValidatedProductFields;
