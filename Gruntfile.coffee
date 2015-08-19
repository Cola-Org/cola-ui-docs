module.exports = (grunt) ->
	grunt.initConfig
		pkg: grunt.file.readJSON "package.json"
		clean:
			build:
				expand: true
				cwd: "public"
				src: ["cola-ui/**"]
		copy:
			cola:
				expand: true
				cwd: "../cola-ui"
				src: ["dest/dev/**"]
				dest: "public/cola-ui"
			includeJs:
				expand: true
				cwd: "../cola-ui/examples"
				src: ["include-all.js"]
				dest: "public"
		coffee:
			docs:
				options:
					sourceMap: false
					join: true
				files:
					"public/docs.js": [
						"src/docs.coffee"
					]
					"public/cola-interceptor.js": [
						"src/cola-interceptor.coffee"
					]
		less:
			docs:
				options:
					sourceMap: false
					join: true
				files:
					"public/docs.css": [
						"src/*.less"
					]
		watch:
			coffee:
				files: ["src/**/*.coffee"]
				tasks: "coffee"
			less:
				files: ["src/**/*.less"]
				tasks: "less"
		replace:
			dorado:
				src: ['views/**/*.jade']
				overwrite: true
				replacements: [{
					from: "ui:"
					to: "class:"
				}]


	grunt.loadNpmTasks "grunt-contrib-copy"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-less"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks 'grunt-text-replace'

	grunt.registerTask "default", ["clean:build", "copy:cola", "copy:includeJs", "coffee", "less"]
	grunt.registerTask "compile", ["coffee", "less"]
	grunt.registerTask "w", ["watch"]