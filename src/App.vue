<template>
	<div class="content">
		<h1 class="px-2 items-center justify-between">Hello world!</h1>
		<p>Start building amazing things with Rsbuild.</p>
		<div class="">
			<a href="/login" class="btn btn-primary">Login</a>
			<a href="/software" class="btn btn-primary">SoftWare</a>
		</div>
		<div class="api-test">
			<input v-model="apiUrl" placeholder="Enter API URL" class="input-field" />
			<textarea v-model="params" placeholder="Enter JSON parameters" class="textarea-field"></textarea>
			<button @click="testApi" class="btn btn-secondary">Test API</button>
		</div>
		<div class="w-[80%] bg-light-50 rounded-md text-[#333]">{{ responseData }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import md5 from 'md5';

const apiUrl = ref('/system?action=GetNetWork');
const params = ref('{}');
const responseData = ref('');

/**
 * @description 创建token，API请求
 * @returns { object } { requestTime, requestToken }
 */
const createToken = (): any => {
	const requestTime = Date.now();
	const agentKey: string = window.vite_public_proxy_key; // 秘钥
	const requestToken = md5(String(requestTime).concat(md5(agentKey)));
	return { requestTime, requestToken };
};

const testApi = async () => {
	try {
		const { requestTime, requestToken } = createToken();
		console.log(requestTime, requestToken);
		const response = await fetch('/api' + apiUrl.value, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				...JSON.parse(params.value),
				request_time: requestTime.toString(),
				request_token: requestToken,
			}).toString(),
		});
		const data = await response.json();
		responseData.value = JSON.stringify(data, null, 2);
		console.log('Response:', data);
	} catch (error) {
		responseData.value = JSON.stringify(error, null, 2);
		console.error('Error:', error);
	}
};

console.log(window);
</script>

<style scoped>
.input-field,
.textarea-field {
	width: 80%;
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 1rem;
}

.input-field:focus,
.textarea-field:focus {
	border-color: #007bff;
	outline: none;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}
.api-test {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.btn-secondary {
	background-color: #6c757d;
	color: white;
	border: none;
	padding: 10px 20px;
	font-size: 1rem;
	cursor: pointer;
	border-radius: 4px;
	margin-top: 10px;
}
.api-response {
	width: 80%;
	margin: 20px auto;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 4px;
	background-color: #666;
	font-size: 1rem;
	white-space: pre-wrap;
	word-wrap: break-word;
	color: #fcfcfc;
	text-align: left;
}
.btn-secondary:hover {
	background-color: #5a6268;
}
.content {
	display: flex;
	min-height: 100vh;
	line-height: 1.1;
	text-align: center;
	flex-direction: column;
	justify-content: center;
}

.content h1 {
	font-size: 3.6rem;
	font-weight: 700;
}

.content p {
	font-size: 1.2rem;
	font-weight: 400;
	opacity: 0.5;
}
</style>
