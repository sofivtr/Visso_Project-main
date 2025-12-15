const modules = import.meta.glob([
	'../images/*.{png,jpg,jpeg,svg,webp,avif}',
	'../images/**/*.{png,jpg,jpeg,svg,webp,avif}'
], { eager: true, import: 'default' });

const formattedImages = {};

for (const path in modules) {
	const fileName = path.split('/').pop() || path;
	const key = fileName.replace(/\.[^/.]+$/, '');
	formattedImages[key] = modules[path];
}

export default formattedImages;