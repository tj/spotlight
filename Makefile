
build: index.js style.css components
	@component build --dev

dist: components
	@component build

components: component.json
	@component install

clean:
	rm -fr build components

release: dist
	tar -czf ../spotlight.tgz ../spotlight

.PHONY: clean release