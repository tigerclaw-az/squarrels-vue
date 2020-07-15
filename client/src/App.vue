<template>
	<div v-cloak id="app">
		<router-view :key="$route.fullPath" />
	</div>
</template>

<style lang="scss" src="./app.scss"></style>
