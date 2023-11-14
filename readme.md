# Griffin v5 and v4 

## v5 branch
This branch is the Griffin code that converts a chart template produced by the new (database-based) [https://github.com/pewtrusts/chart-builder-v5](Griffin Chart Builder) into an interactive chart by passing data to Highcharts.

The Chart Builder uses this repo as a submodule. When the new version of Griffin charts goes live, they will need this repo's built files to be packaged and uploaded to Sitecore.

Files are built with `npx webpack`, which exports to the /dist directory. Webpack returns the hash in a console log and generates a version.txt file. I've been zipping every version with that hash as an identifier, and putting into /etc like this: `zip ./etc/Griffin-v5_1_{hash} -r -j ./dist/*` so that I have a reference for what's live.

Those built files are currently stored in the `~/media/data-visualizations/interactives/griffin-v5_1` directory of the media library.

## v4 branch
v4 is the code for the previous, nondatabase-based version of Griffin currently (as of April 2022) used for Griffin charts on the live site.