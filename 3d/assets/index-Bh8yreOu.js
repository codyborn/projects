const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./preview-DS5eA6rY.js","./shapes-Br0M2pDY.js","./Game-B7loHA1_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,Ar as n,B as r,Bn as i,Bt as a,C as o,Cr as s,D as c,Dr as l,Dt as u,E as d,Er as f,Et as p,F as m,Ft as h,G as g,Gt as _,H as v,Ht as y,I as b,In as x,It as S,J as C,Jn as w,K as T,Kn as E,Kt as ee,Lt as D,M as O,Mn as k,Mr as te,Mt as A,N as ne,Nn as re,Nr as j,Nt as ie,Or as ae,Ot as oe,P as se,Pn as ce,Pr as le,Pt as M,Qn as ue,R as de,Rn as fe,Rt as pe,S as me,Sr as he,St as ge,T as _e,Tr as ve,Tt as ye,Ut as be,V as xe,Vt as Se,W as Ce,Wt as we,X as N,Xn as Te,Y as Ee,Yn as De,Yt as Oe,Z as ke,Zt as Ae,_ as je,_r as P,_t as Me,a as Ne,ar as Pe,at as Fe,b as F,br as Ie,bt as Le,c as Re,cr as ze,ct as I,d as Be,dr as Ve,dt as L,er as R,et as He,f as Ue,ft as We,g as Ge,gr as Ke,gt as qe,h as z,hr as Je,ht as Ye,i as B,ir as Xe,it as Ze,j as Qe,jr as $e,jt as et,k as tt,kr as nt,kt as rt,l as it,lr as at,lt as ot,m as V,mr as st,mt as ct,n as lt,nn as ut,nt as dt,o as ft,or as pt,ot as mt,p as ht,pr as gt,pt as _t,q as vt,qn as yt,qt as bt,r as xt,rr as St,rt as Ct,s as wt,sr as Tt,st as Et,t as Dt,tn as Ot,tr as kt,tt as At,u as jt,ut as Mt,v as Nt,vr as H,vt as Pt,w as Ft,wr as It,wt as Lt,x as Rt,xr as zt,xt as Bt,y as Vt,yr as Ht,z as Ut,zn as Wt,zt as Gt}from"./shapes-Br0M2pDY.js";var Kt=Object.create,qt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,Yt=Object.getOwnPropertyNames,Xt=Object.getPrototypeOf,Zt=Object.prototype.hasOwnProperty,Qt=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),$t=(e,t,n,r)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var i=Yt(t),a=0,o=i.length,s;a<o;a++)s=i[a],!Zt.call(e,s)&&s!==n&&qt(e,s,{get:(e=>t[e]).bind(null,s),enumerable:!(r=Jt(t,s))||r.enumerable});return e},en=(e,t,n)=>(n=e==null?{}:Kt(Xt(e)),$t(t||!e||!e.__esModule||!Zt.call(e,`default`)?qt(n,`default`,{value:e,enumerable:!0}):n,e));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function tn(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function nn(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var U={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},W={common:{diffuse:{value:new N(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new A},alphaMap:{value:null},alphaMapTransform:{value:new A},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new A}},envmap:{envMap:{value:null},envMapRotation:{value:new A},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new A}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new A}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new A},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new A},normalScale:{value:new P(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new A},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new A}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new A}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new A}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new N(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new N(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new A},alphaTest:{value:0},uvTransform:{value:new A}},sprite:{diffuse:{value:new N(16777215)},opacity:{value:1},center:{value:new P(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new A},alphaMap:{value:null},alphaMapTransform:{value:new A},alphaTest:{value:0}}},rn={basic:{uniforms:$e([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:U.meshbasic_vert,fragmentShader:U.meshbasic_frag},lambert:{uniforms:$e([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new N(0)},envMapIntensity:{value:1}}]),vertexShader:U.meshlambert_vert,fragmentShader:U.meshlambert_frag},phong:{uniforms:$e([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new N(0)},specular:{value:new N(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:U.meshphong_vert,fragmentShader:U.meshphong_frag},standard:{uniforms:$e([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new N(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag},toon:{uniforms:$e([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new N(0)}}]),vertexShader:U.meshtoon_vert,fragmentShader:U.meshtoon_frag},matcap:{uniforms:$e([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:U.meshmatcap_vert,fragmentShader:U.meshmatcap_frag},points:{uniforms:$e([W.points,W.fog]),vertexShader:U.points_vert,fragmentShader:U.points_frag},dashed:{uniforms:$e([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:U.linedashed_vert,fragmentShader:U.linedashed_frag},depth:{uniforms:$e([W.common,W.displacementmap]),vertexShader:U.depth_vert,fragmentShader:U.depth_frag},normal:{uniforms:$e([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:U.meshnormal_vert,fragmentShader:U.meshnormal_frag},sprite:{uniforms:$e([W.sprite,W.fog]),vertexShader:U.sprite_vert,fragmentShader:U.sprite_frag},background:{uniforms:{uvTransform:{value:new A},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:U.background_vert,fragmentShader:U.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new A}},vertexShader:U.backgroundCube_vert,fragmentShader:U.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:U.cube_vert,fragmentShader:U.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:U.equirect_vert,fragmentShader:U.equirect_frag},distance:{uniforms:$e([W.common,W.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:U.distance_vert,fragmentShader:U.distance_frag},shadow:{uniforms:$e([W.lights,W.fog,{color:{value:new N(0)},opacity:{value:1}}]),vertexShader:U.shadow_vert,fragmentShader:U.shadow_frag}};rn.physical={uniforms:$e([rn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new A},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new A},clearcoatNormalScale:{value:new P(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new A},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new A},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new A},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new A},sheen:{value:0},sheenColor:{value:new N(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new A},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new A},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new A},transmissionSamplerSize:{value:new P},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new A},attenuationDistance:{value:0},attenuationColor:{value:new N(0)},specularColor:{value:new N(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new A},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new A},anisotropyVector:{value:new P},anisotropyMap:{value:null},anisotropyMapTransform:{value:new A}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag};var an={r:0,b:0,g:0},on=new ie,sn=new A;sn.set(-1,0,0,0,1,0,0,0,1);function cn(e,t,n,i,a,o){let c=new N(0),l=a===!0?0:1,u,d,f=null,p=0,m=null;function h(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function g(t){let r=!1,i=h(t);i===null?v(c,l):i&&i.isColor&&(v(i,1),r=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?n.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,o),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function _(t,n){let a=h(n);a&&a.isCubeTexture?(d===void 0&&(d=new M(new r(1,1,1),new De({name:`BackgroundCubeMaterial`,uniforms:s(rn.backgroundCube.uniforms),vertexShader:rn.backgroundCube.vertexShader,fragmentShader:rn.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute(`normal`),d.geometry.deleteAttribute(`uv`),d.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(d)),d.material.uniforms.envMap.value=a,d.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(on.makeRotationFromEuler(n.backgroundRotation)).transpose(),a.isRenderTargetTexture===!1&&d.material.uniforms.backgroundRotation.value.premultiply(sn),d.material.toneMapped=ke.getTransfer(a.colorSpace)!==yt,(f!==a||p!==a.version||m!==e.toneMapping)&&(d.material.needsUpdate=!0,f=a,p=a.version,m=e.toneMapping),d.layers.enableAll(),t.unshift(d,d.geometry,d.material,0,0,null)):a&&a.isTexture&&(u===void 0&&(u=new M(new bt(2,2),new De({name:`BackgroundMaterial`,uniforms:s(rn.background.uniforms),vertexShader:rn.background.vertexShader,fragmentShader:rn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(u)),u.material.uniforms.t2D.value=a,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.toneMapped=ke.getTransfer(a.colorSpace)!==yt,a.matrixAutoUpdate===!0&&a.updateMatrix(),u.material.uniforms.uvTransform.value.copy(a.matrix),(f!==a||p!==a.version||m!==e.toneMapping)&&(u.material.needsUpdate=!0,f=a,p=a.version,m=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null))}function v(t,r){t.getRGB(an,nt(e)),n.buffers.color.setClear(an.r,an.g,an.b,r,o)}function y(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return c},setClearColor:function(e,t=1){c.set(e),l=t,v(c,l)},getClearAlpha:function(){return l},setClearAlpha:function(e){l=e,v(c,l)},render:g,addToRenderList:_,dispose:y}}function ln(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function un(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function dn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(j(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&j(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&j(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function fn(e){let t=this,n=null,r=0,i=!1,a=!1,o=new ee,s=new A,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var pn=class extends zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new At(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},a=new r(5,5,5),o=new De({name:`CubemapFromEquirect`,uniforms:s(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});o.uniforms.tEquirect.value=n;let c=new M(a,o),l=n.minFilter;return n.minFilter===1008&&(n.minFilter=ye),new e(1,10,this).update(t,c),n.minFilter=l,c.geometry.dispose(),c.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},mn=256,hn=3,gn=20,_n=256,vn=16,yn=3,bn=new H,xn=new N,Sn=class t{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new e(1,10,null),this._boxMesh=new M(new r(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,n=0,r=.1,i=100,a={}){let{size:o=256,position:s=bn}=a,c=this._renderer;this._setSize(o);let l=this._allocateTarget(),u=this._getSourceTarget(!0);n>0&&(u.texture.mipmapsAutoUpdate=!1);let d=c.autoClear,f=c.autoClearColor,p=c.autoClearDepth,m=c.autoClearStencil,h=t.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,h===null&&(t.background=c.getClearColor(xn));let g=new e(r,i,u);return g.position.copy(s),g.update(c,t),c.autoClear=d,c.autoClearColor=f,c.autoClearDepth=p,c.autoClearStencil=m,t.background=h,n>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(l,n)),this._applyPMREM(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=On(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(mn,l(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?mn:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Cn(e,!1,!1),n=Math.log2(e)-hn;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Cn(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=kn()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=On()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Tn(),this._integrationMaterial=En());let n=this._cubeSize,r=e.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/vn);for(let o=0;o<=r;o++){let s=t.lodToRoughness(o,r);if(o>r-yn)a.roughness.value=s,this._renderCube(e,o,this._integrationMaterial);else{let t=s>0?Math.log2(n)+.5*Math.log2(6/(_n*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=t,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Dn());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Cn(e,t,n){return new pn(e,{minFilter:p,generateMipmaps:t,type:Bt,colorSpace:oe,depthBuffer:n})}function wn(e,t,n){return new De({name:e,uniforms:t,vertexShader:U.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Tn(){return wn(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${_n}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function En(){return wn(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:vn}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Dn(){return wn(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${gn}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function On(){return wn(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function kn(){return wn(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function An(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new pn(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Sn(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Sn(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function jn(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&le(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Mn(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Tt:pt)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Nn(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Pn(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:f(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Fn(e,t,n){let r=new WeakMap,i=new Ht;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Ze(h,p,m,u);g.type=Ye,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new P(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function In(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Ln={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Rn(e,t,n,r,i,a){let o=new zt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new v;u.setAttribute(`position`,new ct([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new ct([0,2,0,0,2,0],2));let d=new ce({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new M(u,d),p=new be(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,y=null,b=[],x=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<b.length;n++){let r=b[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){b=e,x=b.length>0&&b[0].isRenderPass===!0;let t=o.width,n=o.height;b.length>0&&s===null&&(s=new zt(t,n,{type:Bt,depthBuffer:!1,stencilBuffer:!1}),c=new zt(t,n,{type:Bt,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&b.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new I(t,n),a===!0&&(l.format=Et,l.type=Ve)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<b.length;e++){let i=b[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&b.length===0)return!1;if(y=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return x===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return x},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<b.length;i++){let a=b[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},ke.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Ln[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(y),e.render(f,p),y=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var zn=new St,Bn=new I(1,1),Vn=new He(1),Hn=new Ze,Un=new Ct,Wn=new At,Gn=[],Kn=[],qn=new Float32Array(16),Jn=new Float32Array(9),Yn=new Float32Array(4);function Xn(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Gn[i];if(a===void 0&&(a=new Float32Array(i),Gn[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Zn(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Qn(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function $n(e,t){let n=Kn[t];n===void 0&&(n=new Int32Array(t),Kn[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function er(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function tr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zn(n,t))return;e.uniform2fv(this.addr,t),Qn(n,t)}}function nr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Zn(n,t))return;e.uniform3fv(this.addr,t),Qn(n,t)}}function rr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zn(n,t))return;e.uniform4fv(this.addr,t),Qn(n,t)}}function ir(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Qn(n,t)}else{if(Zn(n,r))return;Yn.set(r),e.uniformMatrix2fv(this.addr,!1,Yn),Qn(n,r)}}function ar(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Qn(n,t)}else{if(Zn(n,r))return;Jn.set(r),e.uniformMatrix3fv(this.addr,!1,Jn),Qn(n,r)}}function or(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Qn(n,t)}else{if(Zn(n,r))return;qn.set(r),e.uniformMatrix4fv(this.addr,!1,qn),Qn(n,r)}}function sr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function cr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zn(n,t))return;e.uniform2iv(this.addr,t),Qn(n,t)}}function lr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Zn(n,t))return;e.uniform3iv(this.addr,t),Qn(n,t)}}function ur(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zn(n,t))return;e.uniform4iv(this.addr,t),Qn(n,t)}}function dr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function fr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zn(n,t))return;e.uniform2uiv(this.addr,t),Qn(n,t)}}function pr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Zn(n,t))return;e.uniform3uiv(this.addr,t),Qn(n,t)}}function mr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zn(n,t))return;e.uniform4uiv(this.addr,t),Qn(n,t)}}function hr(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function gr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?hr(Bn):zn,n.setTexture2D(t||a,i)}function _r(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Un,i)}function vr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?hr(Vn):Wn,n.setTextureCube(t||a,i)}function yr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Hn,i)}function br(e){switch(e){case 5126:return er;case 35664:return tr;case 35665:return nr;case 35666:return rr;case 35674:return ir;case 35675:return ar;case 35676:return or;case 5124:case 35670:return sr;case 35667:case 35671:return cr;case 35668:case 35672:return lr;case 35669:case 35673:return ur;case 5125:return dr;case 36294:return fr;case 36295:return pr;case 36296:return mr;case 35678:case 36198:case 36298:case 36306:case 35682:return gr;case 35679:case 36299:case 36307:return _r;case 35680:case 36300:case 36308:case 36293:return vr;case 36289:case 36303:case 36311:case 36292:return yr}}function xr(e,t){e.uniform1fv(this.addr,t)}function Sr(e,t){let n=Xn(t,this.size,2);e.uniform2fv(this.addr,n)}function Cr(e,t){let n=Xn(t,this.size,3);e.uniform3fv(this.addr,n)}function wr(e,t){let n=Xn(t,this.size,4);e.uniform4fv(this.addr,n)}function Tr(e,t){let n=Xn(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Er(e,t){let n=Xn(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Dr(e,t){let n=Xn(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Or(e,t){e.uniform1iv(this.addr,t)}function kr(e,t){e.uniform2iv(this.addr,t)}function Ar(e,t){e.uniform3iv(this.addr,t)}function jr(e,t){e.uniform4iv(this.addr,t)}function Mr(e,t){e.uniform1uiv(this.addr,t)}function Nr(e,t){e.uniform2uiv(this.addr,t)}function Pr(e,t){e.uniform3uiv(this.addr,t)}function Fr(e,t){e.uniform4uiv(this.addr,t)}function Ir(e,t,n){let r=this.cache,i=t.length,a=$n(n,i);Zn(r,a)||(e.uniform1iv(this.addr,a),Qn(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?hr(Bn):zn;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Lr(e,t,n){let r=this.cache,i=t.length,a=$n(n,i);Zn(r,a)||(e.uniform1iv(this.addr,a),Qn(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Un,a[e])}function Rr(e,t,n){let r=this.cache,i=t.length,a=$n(n,i);Zn(r,a)||(e.uniform1iv(this.addr,a),Qn(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?hr(Vn):Wn;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function zr(e,t,n){let r=this.cache,i=t.length,a=$n(n,i);Zn(r,a)||(e.uniform1iv(this.addr,a),Qn(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Hn,a[e])}function Br(e){switch(e){case 5126:return xr;case 35664:return Sr;case 35665:return Cr;case 35666:return wr;case 35674:return Tr;case 35675:return Er;case 35676:return Dr;case 5124:case 35670:return Or;case 35667:case 35671:return kr;case 35668:case 35672:return Ar;case 35669:case 35673:return jr;case 5125:return Mr;case 36294:return Nr;case 36295:return Pr;case 36296:return Fr;case 35678:case 36198:case 36298:case 36306:case 35682:return Ir;case 35679:case 36299:case 36307:return Lr;case 35680:case 36300:case 36308:case 36293:return Rr;case 36289:case 36303:case 36311:case 36292:return zr}}var Vr=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=br(t.type)}},Hr=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Br(t.type)}},Ur=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Wr=/(\w+)(\])?(\[|\.)?/g;function Gr(e,t){e.seq.push(t),e.map[t.id]=t}function Kr(e,t,n){let r=e.name,i=r.length;for(Wr.lastIndex=0;;){let a=Wr.exec(r),o=Wr.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Gr(n,l===void 0?new Vr(s,e,t):new Hr(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ur(s),Gr(n,e)),n=e}}}var qr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Kr(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Jr(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Yr=37297,Xr=0;function Zr(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Qr=new A;function $r(e){ke._getMatrix(Qr,ke.workingColorSpace,e);let t=`mat3( ${Qr.elements.map(e=>e.toFixed(4))} )`;switch(ke.getTransfer(e)){case rt:return[t,`LinearTransferOETF`];case yt:return[t,`sRGBTransferOETF`];default:return j(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function ei(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Zr(e.getShaderSource(t),r)}return i}function ti(e,t){let n=$r(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var ni={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function ri(e,t){let n=ni[t];return n===void 0?(j(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var ii=new H;function ai(){return ke.getLuminanceCoefficients(ii),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${ii.x.toFixed(4)}, ${ii.y.toFixed(4)}, ${ii.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function oi(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(li).join(`
`)}function si(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ci(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function li(e){return e!==``}function ui(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function di(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var fi=/^[ \t]*#include +<([\w\d./]+)>/gm;function pi(e){return e.replace(fi,mi)}function mi(e,t){let n=U[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return pi(n)}var hi=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gi(e){return e.replace(hi,_i)}function _i(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function vi(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var yi={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function bi(e){return yi[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var xi={302:`ENVMAP_MODE_REFRACTION`};function Si(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:xi[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Ci={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function wi(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Ci[e.combine]||`ENVMAP_BLENDING_NONE`}function Ti(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=bi(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Si(n),d=wi(n),p=oi(n),m=si(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(li).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(li).join(`
`),_.length>0&&(_+=`
`)):(g=[vi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(li).join(`
`),_=[vi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:U.tonemapping_pars_fragment,n.toneMapping===0?``:ri(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,U.colorspace_pars_fragment,ti(`linearToOutputTexel`,n.outputColorSpace),ai(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(li).join(`
`)),o=pi(o),o=ui(o,n),o=di(o,n),s=pi(s),s=ui(s,n),s=di(s,n),o=gi(o),s=gi(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Jr(i,i.VERTEX_SHADER,y),S=Jr(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=ei(i,x,`vertex`),n=ei(i,S,`fragment`);f(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):j(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new qr(i,h),T=ci(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Yr)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Xr++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Ei=0,Di=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Oi(e),t.set(e,n)),n}},Oi=class{constructor(e){this.id=Ei++,this.code=e,this.usedTimes=0}};function ki(e){return e===1030||e===37490||e===36285}function Ai(e,t,n,r,i,a){let o=new Lt,s=new Di,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&j(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,ee,D,O;if(x){let e=rn[x];E=e.vertexShader,ee=e.fragmentShader}else{E=i.vertexShader,ee=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),D=e.id,O=t.id}let k=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),A=m.isInstancedMesh===!0,ne=m.isBatchedMesh===!0,re=!!i.map,ie=!!i.matcap,ae=!!b,oe=ae&&b.isPMREMTexture===!0,se=!!i.aoMap,ce=!!i.lightMap,le=!!i.bumpMap&&i.wireframe===!1,M=!!i.normalMap,ue=!!i.displacementMap,de=!!i.emissiveMap,fe=!!i.metalnessMap,pe=!!i.roughnessMap,me=i.anisotropy>0,he=i.clearcoat>0,ge=i.diffuseRoughness>0,_e=i.dispersion>0,ve=i.retroreflectivity>0,ye=i.iridescence>0,be=i.sheen>0,xe=i.transmission>0,Se=me&&!!i.anisotropyMap,Ce=he&&!!i.clearcoatMap,we=he&&!!i.clearcoatNormalMap,N=he&&!!i.clearcoatRoughnessMap,Te=ge&&!!i.diffuseRoughnessMap,Ee=ye&&!!i.iridescenceMap,De=ye&&!!i.iridescenceThicknessMap,Oe=be&&!!i.sheenColorMap,Ae=be&&!!i.sheenRoughnessMap,je=!!i.specularMap,P=!!i.specularColorMap,Me=!!i.specularIntensityMap,Ne=xe&&!!i.transmissionMap,Pe=xe&&!!i.thicknessMap,Fe=!!i.gradientMap,F=!!i.alphaMap,Ie=i.alphaTest>0,Le=!!i.alphaHash,Re=!!i.extensions,ze=0;i.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(ze=e.toneMapping);let I=oe?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Be={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:ee,defines:i.defines,customVertexShaderID:D,customFragmentShaderID:O,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:ne,batchingColor:ne&&m._colorsTexture!==null,instancing:A,instancingColor:A&&m.instanceColor!==null,instancingMorph:A&&m.morphTexture!==null,outputColorSpace:k===null?e.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:ke.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:ie,envMap:ae,envMapMode:ae&&b.mapping,envMapPMREM:oe,envMapMaxLod:oe?I.length-1:null,envMapSize:oe?I[0].width:null,aoMap:se,lightMap:ce,bumpMap:le,normalMap:M,displacementMap:ue,emissiveMap:de,normalMapObjectSpace:M&&i.normalMapType===1,normalMapTangentSpace:M&&i.normalMapType===0,packedNormalMap:M&&i.normalMapType===0&&ki(i.normalMap.format),metalnessMap:fe,roughnessMap:pe,anisotropy:me,anisotropyMap:Se,clearcoat:he,clearcoatMap:Ce,clearcoatNormalMap:we,clearcoatRoughnessMap:N,diffuseRoughness:ge,diffuseRoughnessMap:Te,dispersion:_e,retroreflection:ve,iridescence:ye,iridescenceMap:Ee,iridescenceThicknessMap:De,sheen:be,sheenColorMap:Oe,sheenRoughnessMap:Ae,specularMap:je,specularColorMap:P,specularIntensityMap:Me,transmission:xe,transmissionMap:Ne,thicknessMap:Pe,gradientMap:Fe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:F,alphaTest:Ie,alphaHash:Le,combine:i.combine,mapUv:re&&p(i.map.channel),aoMapUv:se&&p(i.aoMap.channel),lightMapUv:ce&&p(i.lightMap.channel),bumpMapUv:le&&p(i.bumpMap.channel),normalMapUv:M&&p(i.normalMap.channel),displacementMapUv:ue&&p(i.displacementMap.channel),emissiveMapUv:de&&p(i.emissiveMap.channel),metalnessMapUv:fe&&p(i.metalnessMap.channel),roughnessMapUv:pe&&p(i.roughnessMap.channel),anisotropyMapUv:Se&&p(i.anisotropyMap.channel),clearcoatMapUv:Ce&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:we&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:N&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Te&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:Ee&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:De&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:Oe&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&p(i.sheenRoughnessMap.channel),specularMapUv:je&&p(i.specularMap.channel),specularColorMapUv:P&&p(i.specularColorMap.channel),specularIntensityMapUv:Me&&p(i.specularIntensityMap.channel),transmissionMapUv:Ne&&p(i.transmissionMap.channel),thicknessMapUv:Pe&&p(i.thicknessMap.channel),alphaMapUv:F&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(M||me),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(re||F),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&M===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:ze,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&ke.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:de&&i.emissiveMap.isVideoTexture===!0&&ke.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Re&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Re&&i.extensions.multiDraw===!0||ne)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Be.vertexUv1s=c.has(1),Be.vertexUv2s=c.has(2),Be.vertexUv3s=c.has(3),c.clear(),Be}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=rn[t];n=ze.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new Ti(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function ji(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Mi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ni(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Pi(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Mi),r.length>1&&r.sort(t||Ni),i.length>1&&i.sort(t||Ni)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Fi(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Pi,e.set(t,[i])):n>=r.length?(i=new Pi,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ii(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new H,color:new N};break;case`SpotLight`:n={position:new H,direction:new H,color:new N,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new H,color:new N,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new H,skyColor:new N,groundColor:new N};break;case`RectAreaLight`:n={color:new N,position:new H,halfWidth:new H,halfHeight:new H}}return e[t.id]=n,n}}}function Li(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Ri=0;function zi(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Bi(e){let t=new Ii,n=Li(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new H);let i=new H,a=new ie,o=new ie;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(zi);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=W.LTC_FLOAT_1,r.rectAreaLTC2=W.LTC_FLOAT_2):(r.rectAreaLTC1=W.LTC_HALF_1,r.rectAreaLTC2=W.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Ri++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Vi(e){let t=new Bi(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Hi(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Vi(e),t.set(n,[a])):r>=i.length?(a=new Vi(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Ui=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wi=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Gi=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],Ki=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],qi=new ie,Ji=new H,Yi=new H;function Xi(e,t,n){let r=new Me,i=new P,o=new P,s=new Ht,c=new S,l=new D,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new De({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new P},radius:{value:4}},vertexShader:Ui,fragmentShader:Wi}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new v;h.setAttribute(`position`,new xe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new M(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let y=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;this.type===2&&(j(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=y!==this.type;m&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){j(`WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;i.copy(f.mapSize);let h=f.getFrameExtents();i.multiply(h),o.copy(f.mapSize),(i.x>d||i.y>d)&&(i.x>d&&(o.x=Math.floor(d/h.x),i.x=o.x*h.x,f.mapSize.x=o.x),i.y>d&&(o.y=Math.floor(d/h.y),i.y=o.y*h.y,f.mapSize.y=o.y));let g=e.state.buffers.depth.getReversed();if(f.camera._reversedDepth=g,f.map===null||m===!0){if(f.map!==null&&(f.map.depthTexture!==null&&(f.map.depthTexture.dispose(),f.map.depthTexture=null),f.map.dispose()),this.type===3){if(u.isPointLight){j(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}f.map=new zt(i.x,i.y,{format:k,type:Bt,minFilter:ye,magFilter:ye,generateMipmaps:!1}),f.map.texture.name=u.name+`.shadowMap`,f.map.depthTexture=new I(i.x,i.y,Ye),f.map.depthTexture.name=u.name+`.shadowMapDepth`,f.map.depthTexture.format=mt,f.map.depthTexture.compareFunction=null,f.map.depthTexture.minFilter=a,f.map.depthTexture.magFilter=a}else u.isPointLight?(f.map=new pn(i.x),f.map.depthTexture=new He(i.x,gt)):(f.map=new zt(i.x,i.y),f.map.depthTexture=new I(i.x,i.y,gt)),f.map.depthTexture.name=u.name+`.shadowMap`,f.map.depthTexture.format=mt,this.type===1?(f.map.depthTexture.compareFunction=g?518:515,f.map.depthTexture.minFilter=ye,f.map.depthTexture.magFilter=ye):(f.map.depthTexture.compareFunction=null,f.map.depthTexture.minFilter=a,f.map.depthTexture.magFilter=a);f.camera.updateProjectionMatrix()}f.map.isWebGLCubeRenderTarget!==!0&&(f.map.width!==i.x||f.map.height!==i.y)&&f.map.setSize(i.x,i.y);let _=f.map.isWebGLCubeRenderTarget?6:f.getViewportCount();u.isPointLight!==!0&&f.updateMatrices(u,c);let v=f.camera.layers.mask&4294967294?f.camera.layers:c.layers;for(let t=0;t<_;t++){let i=f.getCamera(t);if(u.isPointLight){let e=f.camera,n=f.matrix,r=u.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Ji.setFromMatrixPosition(u.matrixWorld),e.position.copy(Ji),Yi.copy(e.position),Yi.add(Gi[t]),e.up.copy(Ki[t]),e.lookAt(Yi),e.updateMatrixWorld(),n.makeTranslation(-Ji.x,-Ji.y,-Ji.z),qi.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),f._frustum.setFromProjectionMatrix(qi,e.coordinateSystem,e.reversedDepth)}if(f.map.isWebGLCubeRenderTarget)e.setRenderTarget(f.map,t),e.clear();else{t===0&&(e.setRenderTarget(f.map),e.clear());let n=f.getViewport(t);s.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),p.viewport(s)}r=f.getFrustum(t),C(n,c,i,u,v,this.type)}f.isPointLightShadow!==!0&&this.type===3&&b(f,c),f.needsUpdate=!1}y=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function b(n,r){let a=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null?n.mapPass=new zt(i.x,i.y,{format:k,type:Bt}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),p.uniforms.shadow_pass.value=n.map.depthTexture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,m,g,null)}function x(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,w)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function C(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=x(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=x(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)C(l[e],i,a,o,s,c)}function w(e){e.target.removeEventListener(`dispose`,w);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Zi(e,t){function n(){let t=!1,n=new Ht,r=null,i=new Ht(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,a=null,o=null,s=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=s;s=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?pe(e.DEPTH_TEST):me(e.DEPTH_TEST)},setMask:function(t){a!==t&&!n&&(e.depthMask(t),a=t)},setFunc:function(t){if(r&&(t=i[t]),o!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}o=t}},setLocked:function(e){n=e},setClear:function(t){s!==t&&(s=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,a=null,o=null,s=null,r=!1}}}function a(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?pe(e.STENCIL_TEST):me(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let o=new n,s=new r,c=new a,l={},u=new WeakMap,d={},p={},m={},h=new WeakMap,g=[],_=null,v=!1,y=null,b=null,x=null,S=null,C=null,w=null,T=null,E=new N(0,0,0),ee=0,D=!1,O=null,k=null,te=null,A=null,ne=null,re=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,ie=0,ae=e.getParameter(e.VERSION);ae.indexOf(`WebGL`)===-1?ae.indexOf(`OpenGL ES`)!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(ae)[1]),j=ie>=2):(ie=parseFloat(/^WebGL (\d)/.exec(ae)[1]),j=ie>=1);let oe=null,se={},ce=e.getParameter(e.SCISSOR_BOX),le=e.getParameter(e.VIEWPORT),M=new Ht().fromArray(ce),ue=new Ht().fromArray(le);function de(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let fe={};fe[e.TEXTURE_2D]=de(e.TEXTURE_2D,e.TEXTURE_2D,1),fe[e.TEXTURE_CUBE_MAP]=de(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[e.TEXTURE_2D_ARRAY]=de(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),fe[e.TEXTURE_3D]=de(e.TEXTURE_3D,e.TEXTURE_3D,1,1),o.setClear(0,0,0,1),s.setClear(1),c.setClear(0),pe(e.DEPTH_TEST),s.setFunc(3),Se(!1),Ce(1),pe(e.CULL_FACE),be(0);function pe(t){d[t]!==!0&&(e.enable(t),d[t]=!0)}function me(t){d[t]!==!1&&(e.disable(t),d[t]=!1)}function he(t,n){return m[t]!==n&&(e.bindFramebuffer(t,n),m[t]=n,t===e.DRAW_FRAMEBUFFER&&(m[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(m[e.DRAW_FRAMEBUFFER]=n),!0)}function ge(t,n){let r=g,i=!1;if(t){r=h.get(n),r===void 0&&(r=[],h.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function _e(t){return _!==t&&(e.useProgram(t),_=t,!0)}let ve={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ve[103]=e.MIN,ve[104]=e.MAX;let ye={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function be(t,n,r,i,a,o,s,c,l,u){if(t===0)v===!0&&(me(e.BLEND),v=!1);else if(v===!1&&(pe(e.BLEND),v=!0),t!==5){if(t!==y||u!==D){if((b!==100||C!==100)&&(e.blendEquation(e.FUNC_ADD),b=100,C=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:f(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:f(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:f(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:f(`WebGLState: Invalid blending: `,t)}x=null,S=null,w=null,T=null,E.set(0,0,0),ee=0,y=t,D=u}}else a||=n,o||=r,s||=i,(n!==b||a!==C)&&(e.blendEquationSeparate(ve[n],ve[a]),b=n,C=a),(r!==x||i!==S||o!==w||s!==T)&&(e.blendFuncSeparate(ye[r],ye[i],ye[o],ye[s]),x=r,S=i,w=o,T=s),(c.equals(E)===!1||l!==ee)&&(e.blendColor(c.r,c.g,c.b,l),E.copy(c),ee=l),y=t,D=!1}function xe(t,n){t.side===2?me(e.CULL_FACE):pe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),Se(r),t.blending===1&&t.transparent===!1?be(0):be(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),s.setFunc(t.depthFunc),s.setTest(t.depthTest),s.setMask(t.depthWrite),o.setMask(t.colorWrite);let i=t.stencilWrite;c.setTest(i),i&&(c.setMask(t.stencilWriteMask),c.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),c.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Te(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?pe(e.SAMPLE_ALPHA_TO_COVERAGE):me(e.SAMPLE_ALPHA_TO_COVERAGE)}function Se(t){O!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),O=t)}function Ce(t){t===0?me(e.CULL_FACE):(pe(e.CULL_FACE),t!==k&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),k=t}function we(t){t!==te&&(j&&e.lineWidth(t),te=t)}function Te(t,n,r){t?(pe(e.POLYGON_OFFSET_FILL),(A!==n||ne!==r)&&(A=n,ne=r,s.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):me(e.POLYGON_OFFSET_FILL)}function Ee(t){t?pe(e.SCISSOR_TEST):me(e.SCISSOR_TEST)}function De(t){t===void 0&&(t=e.TEXTURE0+re-1),oe!==t&&(e.activeTexture(t),oe=t)}function Oe(t,n,r){r===void 0&&(r=oe===null?e.TEXTURE0+re-1:oe);let i=se[r];i===void 0&&(i={type:void 0,texture:void 0},se[r]=i),(i.type!==t||i.texture!==n)&&(oe!==r&&(e.activeTexture(r),oe=r),e.bindTexture(t,n||fe[t]),i.type=t,i.texture=n)}function ke(){let t=se[oe];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ae(){try{e.compressedTexImage2D(...arguments)}catch(e){f(`WebGLState:`,e)}}function je(){try{e.compressedTexImage3D(...arguments)}catch(e){f(`WebGLState:`,e)}}function P(){try{e.texSubImage2D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Me(){try{e.texSubImage3D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Ne(){try{e.compressedTexSubImage2D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Pe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Fe(){try{e.texStorage2D(...arguments)}catch(e){f(`WebGLState:`,e)}}function F(){try{e.texStorage3D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Ie(){try{e.texImage2D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Le(){try{e.texImage3D(...arguments)}catch(e){f(`WebGLState:`,e)}}function Re(t){return p[t]===void 0?e.getParameter(t):p[t]}function ze(t,n){p[t]!==n&&(e.pixelStorei(t,n),p[t]=n)}function I(t){M.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),M.copy(t))}function Be(t){ue.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ue.copy(t))}function Ve(t,n){let r=u.get(n);r===void 0&&(r=new WeakMap,u.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function L(t,n,r){let i=u.get(n).get(t);l[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),l[i]=r)}function R(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),s.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),d={},p={},oe=null,se={},m={},l={},h=new WeakMap,g=[],_=null,v=!1,y=null,b=null,x=null,S=null,C=null,w=null,T=null,E=new N(0,0,0),ee=0,D=!1,O=null,k=null,te=null,A=null,ne=null,M.set(0,0,e.canvas.width,e.canvas.height),ue.set(0,0,e.canvas.width,e.canvas.height),o.reset(),s.reset(),c.reset()}return{buffers:{color:o,depth:s,stencil:c},enable:pe,disable:me,bindFramebuffer:he,drawBuffers:ge,useProgram:_e,setBlending:be,setMaterial:xe,setFlipSided:Se,setCullFace:Ce,setLineWidth:we,setPolygonOffset:Te,setScissorTest:Ee,activeTexture:De,bindTexture:Oe,unbindTexture:ke,compressedTexImage2D:Ae,compressedTexImage3D:je,texImage2D:Ie,texImage3D:Le,pixelStorei:ze,getParameter:Re,updateUBOMapping:Ve,uniformBlockBinding:L,texStorage2D:Fe,texStorage3D:F,texSubImage2D:P,texSubImage3D:Me,compressedTexSubImage2D:Ne,compressedTexSubImage3D:Pe,scissor:I,viewport:Be,reset:R}}function Qi(e,t,n,r,i,o,s){let c=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,l=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),d=new P,m=new WeakMap,h=new Set,g,_=new WeakMap,v=new Set,b=new FinalizationRegistry(e=>v.delete(e)),x=!1;try{x=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function S(e,t){return x?new OffscreenCanvas(e,t):ve(`canvas`)}function w(e,t,n){let r=1,i=R(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);g===void 0&&(g=S(n,a));let o=t?S(n,a):g;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),j(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&j(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function T(e){return e.generateMipmaps}function E(t){e.generateMipmap(t)}function ee(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function D(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];j(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||j(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?rt:ke.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function O(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,j(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function k(e,t){return T(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function te(e){let t=new WeakRef(e);r.get(e).__ref=t,v.add(t),b.register(e,t,t)}function A(e){let t=r.get(e).__ref;t!==void 0&&(v.delete(t),b.unregister(t))}function ne(e){ie(e.target)}function re(e){oe(e.target)}function ie(e){e.removeEventListener(`dispose`,ne),A(e),ce(e),e.isVideoTexture&&m.delete(e),e.isHTMLTexture&&h.delete(e)}function oe(e){e.removeEventListener(`dispose`,re),A(e),M(e)}function se(){for(let e of v){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?oe(t):ie(t))}v.clear(),h.clear()}function ce(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=_.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&le(e),Object.keys(i).length===0&&_.delete(n)}r.remove(e)}function le(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=_.get(i);delete a[n.__cacheKey],s.memory.textures--}function M(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&ie(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),s.memory.textures--),r.remove(a[t])}r.remove(t)}let ue=0;function de(){ue=0}function fe(){return ue}function pe(e){ue=e}function me(){let e=ue;return e>=i.maxTextures&&j(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),ue+=1,e}function he(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ge(t,i){let a=r.get(t);if(t.isVideoTexture&&Ve(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)j(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)j(`WebGLRenderer: Texture marked for update but image is incomplete`);else{Ae(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function _e(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Ae(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function be(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Ae(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function xe(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?je(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let Ce={[Wt]:e.REPEAT,[C]:e.CLAMP_TO_EDGE,[Gt]:e.MIRRORED_REPEAT},we={[a]:e.NEAREST,[y]:e.NEAREST_MIPMAP_NEAREST,[Se]:e.NEAREST_MIPMAP_LINEAR,[ye]:e.LINEAR,[u]:e.LINEAR_MIPMAP_NEAREST,[p]:e.LINEAR_MIPMAP_LINEAR},N={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Te(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&j(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,Ce[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,Ce[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,Ce[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,we[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,we[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,N[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function Ee(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ne),te(n));let i=n.source,a=_.get(i);a===void 0&&(a={},_.set(i,a));let o=he(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},s.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&le(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function De(e,t,n){return Math.floor(Math.floor(e/n)/t)}function Oe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=De(n.start,r.width,4),c=De(t.start,r.width,4);n.start<=i+1&&a===c&&De(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function Ae(t,a,s){let c=e.TEXTURE_2D;(a.isDataArrayTexture||a.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),a.isData3DTexture&&(c=e.TEXTURE_3D);let l=Ee(t,a),u=a.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&a.image instanceof ImageBitmap)){let t=ke.getPrimaries(ke.workingColorSpace),r=a.colorSpace===``?null:ke.getPrimaries(a.colorSpace),i=a.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment);let t=w(a.image,!1,i.maxTextureSize);t=L(a,t);let r=o.convert(a.format,a.colorSpace),f=o.convert(a.type),p=D(a.internalFormat,r,f,a.normalized,a.colorSpace,a.isVideoTexture);Te(c,a);let m,g=a.mipmaps,_=a.isVideoTexture!==!0,v=d.__version===void 0||l===!0,y=u.dataReady,b=k(a,t);if(a.isDepthTexture)p=O(a.format===Et,a.type),v&&(_?n.texStorage2D(e.TEXTURE_2D,1,p,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,p,t.width,t.height,0,r,f,null));else if(a.isDataTexture){if(g.length>0){_&&v&&n.texStorage2D(e.TEXTURE_2D,b,p,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)m=g[t],_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m.width,m.height,r,f,m.data):n.texImage2D(e.TEXTURE_2D,t,p,m.width,m.height,0,r,f,m.data);a.generateMipmaps=!1}else _?(v&&n.texStorage2D(e.TEXTURE_2D,b,p,t.width,t.height),y&&Oe(a,t,r,f)):n.texImage2D(e.TEXTURE_2D,0,p,t.width,t.height,0,r,f,t.data)}else if(a.isCompressedTexture){if(a.isCompressedArrayTexture){_&&v&&n.texStorage3D(e.TEXTURE_2D_ARRAY,b,p,g[0].width,g[0].height,t.depth);for(let i=0,o=g.length;i<o;i++)if(m=g[i],a.format!==1023){if(r!==null){if(_){if(y){if(a.layerUpdates.size>0){let t=ae(m.width,m.height,a.format,a.type);for(let o of a.layerUpdates){let a=m.data.subarray(o*t/m.data.BYTES_PER_ELEMENT,(o+1)*t/m.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,o,m.width,m.height,1,r,a)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,m.width,m.height,t.depth,r,m.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,p,m.width,m.height,t.depth,0,m.data,0,0)}else j(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?y&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,m.width,m.height,t.depth,r,f,m.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,p,m.width,m.height,t.depth,0,r,f,m.data);a.layerUpdates.size>0&&a.clearLayerUpdates()}else{_&&v&&n.texStorage2D(e.TEXTURE_2D,b,p,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)m=g[t],a.format===1023?_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m.width,m.height,r,f,m.data):n.texImage2D(e.TEXTURE_2D,t,p,m.width,m.height,0,r,f,m.data):r===null?j(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?y&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,m.width,m.height,r,m.data):n.compressedTexImage2D(e.TEXTURE_2D,t,p,m.width,m.height,0,m.data)}}else if(a.isDataArrayTexture){if(_){if(v&&n.texStorage3D(e.TEXTURE_2D_ARRAY,b,p,t.width,t.height,t.depth),y){if(a.layerUpdates.size>0){let i=ae(t.width,t.height,a.format,a.type);for(let o of a.layerUpdates){let a=t.data.subarray(o*i/t.data.BYTES_PER_ELEMENT,(o+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,o,t.width,t.height,1,r,f,a)}a.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,f,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,p,t.width,t.height,t.depth,0,r,f,t.data)}else if(a.isData3DTexture)_?(v&&n.texStorage3D(e.TEXTURE_3D,b,p,t.width,t.height,t.depth),y&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,f,t.data)):n.texImage3D(e.TEXTURE_3D,0,p,t.width,t.height,t.depth,0,r,f,t.data);else if(a.isFramebufferTexture){if(v){if(_)n.texStorage2D(e.TEXTURE_2D,b,p,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<b;t++)n.texImage2D(e.TEXTURE_2D,t,p,i,a,0,r,f,null),i>>=1,a>>=1}}}else if(a.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),h.add(a),n.onpaint=e=>{let t=e.changedElements;for(let e of h)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&v){let t=R(g[0]);n.texStorage2D(e.TEXTURE_2D,b,p,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)m=g[t],_?y&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,f,m):n.texImage2D(e.TEXTURE_2D,t,p,r,f,m);a.generateMipmaps=!1}else if(_){if(v){let r=R(t);n.texStorage2D(e.TEXTURE_2D,b,p,r.width,r.height)}y&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,f,t)}else n.texImage2D(e.TEXTURE_2D,0,p,r,f,t);T(a)&&a.mipmapsAutoUpdate===!0&&E(c),d.__version=u.version,a.onUpdate&&a.onUpdate(a)}t.__version=a.version}function je(t,a,s){if(a.image.length!==6)return;let c=Ee(t,a),l=a.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=ke.getPrimaries(ke.workingColorSpace),r=a.colorSpace===``?null:ke.getPrimaries(a.colorSpace),d=a.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=a.isCompressedTexture||a.image[0].isCompressedTexture,p=a.image[0]&&a.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=w(a.image[e],!0,i.maxCubemapSize):m[e]=p?a.image[e].image:a.image[e],m[e]=L(a,m[e]);let h=m[0],g=o.convert(a.format,a.colorSpace),_=o.convert(a.type),v=D(a.internalFormat,g,_,a.normalized,a.colorSpace),y=a.isVideoTexture!==!0,b=u.__version===void 0||c===!0,x=l.dataReady,S=k(a,h);Te(e.TEXTURE_CUBE_MAP,a);let C;if(a.isDepthTexture){if(v=O(a.format===Et,a.type),b){if(y)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,v,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,h.width,h.height,0,g,_,null)}}else if(f){y&&b&&n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=m[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];a.format===1023?y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?j(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=a.mipmaps,y&&b){C.length>0&&S++;let t=R(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(p){y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<C.length;r++){let i=C[r].image[t].image;y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,i.width,i.height,0,g,_,i.data)}}else{y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,m[t]);for(let r=0;r<C.length;r++){let i=C[r];y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,g,_,i.image[t])}}}T(a)&&a.mipmapsAutoUpdate===!0&&E(e.TEXTURE_CUBE_MAP),u.__version=l.version,a.onUpdate&&a.onUpdate(a)}t.__version=a.version}function Me(t,i,a,s,l,u){let d=o.convert(a.format,a.colorSpace),f=o.convert(a.type),p=D(a.internalFormat,d,f,a.normalized,a.colorSpace),m=r.get(i),h=r.get(a);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Be(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,s,l,h.__webglTexture,0,I(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,s,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ne(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=O(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Be(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,I(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,I(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],s=o.convert(a.format,a.colorSpace),l=o.convert(a.type),u=D(a.internalFormat,s,l,a.normalized,a.colorSpace);Be(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,I(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,I(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Pe(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let s=r.get(i.depthTexture);s.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;s.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?xe(i.depthTexture,0):ge(i.depthTexture,0);let u=s.__webglTexture,d=I(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Be(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Be(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Fe(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)Pe(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Pe(i.__webglFramebuffer[0],t,0):Pe(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),Ne(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Ne(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function F(t,n,i){let a=r.get(t);n!==void 0&&Me(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Fe(t)}function Ie(t){let i=t.texture,a=r.get(t),c=r.get(i);t.addEventListener(`dispose`,re),te(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,s.memory.textures++),u){a.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){a.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)a.__webglFramebuffer[t][n]=e.createFramebuffer()}else a.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){a.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)a.__webglFramebuffer[t]=e.createFramebuffer()}else a.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),s.memory.textures++)}if(t.samples>0&&Be(t)===!1){a.__webglMultisampledFramebuffer=e.createFramebuffer(),a.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,a.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];a.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,a.__webglColorRenderbuffer[n]);let i=o.convert(r.format,r.colorSpace),s=o.convert(r.type),c=D(r.internalFormat,i,s,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=I(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,a.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(a.__webglDepthRenderbuffer=e.createRenderbuffer(),Ne(a.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),Te(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)Me(a.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else Me(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);T(i)?E(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,o=l.length;i<o;i++){let o=l[i],s=r.get(o),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),Te(c,o),Me(a.__webglFramebuffer,t,o,e.COLOR_ATTACHMENT0+i,c,0),T(o)&&E(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),Te(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)Me(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else Me(a.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);T(i)?E(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Fe(t)}function Le(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(T(a)&&a.mipmapsAutoUpdate===!0){let t=ee(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),E(t),n.unbindTexture()}}}let Re=[];function ze(t){if(t.samples>0){if(Be(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,c=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),l===!0&&(Re.length=0,Re.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Re.push(c),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Re))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&l){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function I(e){return Math.min(i.maxSamples,e.samples)}function Be(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ve(e){let t=s.render.frame;m.get(e)!==t&&(m.set(e,t),e.update())}function L(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(ke.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&j(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):f(`WebGLTextures: Unsupported texture color space:`,n)),t}function R(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(d.width=e.naturalWidth||e.width,d.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(d.width=e.displayWidth,d.height=e.displayHeight):(d.width=e.width,d.height=e.height),d}this.allocateTextureUnit=me,this.resetTextureUnits=de,this.getTextureUnits=fe,this.setTextureUnits=pe,this.setTexture2D=ge,this.setTexture2DArray=_e,this.setTexture3D=be,this.setTextureCube=xe,this.rebindTextures=F,this.setupRenderTarget=Ie,this.updateRenderTargetMipmap=Le,this.updateMultisampleRenderTarget=ze,this.setupDepthRenderbuffer=Fe,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=Be,this.dispose=se}function $i(e,t){function n(n,r=``){let i,a=ke.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var ea=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ta=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,na=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new We(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new De({vertexShader:ea,fragmentShader:ta,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new M(new bt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ra=class extends L{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new na,g={},v=t.getContextAttributes(),y=null,b=null,x=[],S=[],C=new P,w=null,T=null,E=new _;E.viewport=new Ht;let ee=new _;ee.viewport=new Ht;let D=[E,ee],O=new de,k=null,te=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=x[e];return t===void 0&&(t=new he,x[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=x[e];return t===void 0&&(t=new he,x[e]=t),t.getGripSpace()},this.getHand=function(e){let t=x[e];return t===void 0&&(t=new he,x[e]=t),t.getHandSpace()};function A(e){let t=S.indexOf(e.inputSource);if(t===-1)return;let n=x[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ne(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,ne),r.removeEventListener(`inputsourceschange`,re);for(let e=0;e<x.length;e++){let t=S[e];t!==null&&(S[e]=null,x[e].disconnect(t))}k=null,te=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(y),f=null,d=null,u=null,r=null,b=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(C.width,C.height,!1),T!==null){let e=T.camera;e.fov=T.fov,e.zoom=T.zoom,e.updateProjectionMatrix(),T=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&j(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&j(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(y=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,ne),r.addEventListener(`inputsourceschange`,re),v.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(C),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;v.depth&&(o=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=v.stencil?Et:mt,a=v.stencil?Ve:gt);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new zt(d.textureWidth,d.textureHeight,{format:Ot,type:at,depthTexture:new I(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new zt(f.framebufferWidth,f.framebufferHeight,{format:Ot,type:at,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function re(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=S.indexOf(n);r>=0&&(S[r]=null,x[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=S.indexOf(n);if(r===-1){for(let e=0;e<x.length;e++)if(e>=S.length){S.push(n),r=e;break}else if(S[e]===null){S[e]=n,r=e;break}if(r===-1)break}let i=x[r];i&&i.connect(n)}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=ee.near=E.near=t,O.far=ee.far=E.far=n,(k!==O.near||te!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,te=O.far),O.layers.mask=e.layers.mask|6,E.layers.mask=O.layers.mask&-5,ee.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;ie(O,i);for(let e=0;e<a.length;e++)ie(a[e],i);O.projectionMatrix.copy(E.projectionMatrix),O.projectionMatrixInverse.copy(E.projectionMatrixInverse),T===null&&e.isPerspectiveCamera&&(T={camera:e,fov:e.fov,zoom:e.zoom}),ae(e,O,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ae*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(b,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(b))}let o=D[n];o===void 0&&(o=new _,o.layers.enable(n),o.viewport=new Ht,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new We,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<x.length;e++){let t=S[e],n=x[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ce=new tn;ce.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},ia=new ie,aa=new A;aa.set(-1,0,0,0,1,0,0,0,1);function oa(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,nt(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(ia.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(aa),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function sa(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?j(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):j(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var ca=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),la=null;function ua(){return la===null&&(la=new Fe(ca,16,16,k,Bt),la.name=`DFG_LUT`,la.minFilter=ye,la.magFilter=ye,la.wrapS=C,la.wrapT=C,la.generateMipmaps=!1,la.needsUpdate=!0),la}var da=class{constructor(e={}){let{canvas:t=It(),context:r=null,depth:i=!0,stencil:a=!1,alpha:o=!1,antialias:s=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u=`default`,failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:m=!1,outputBufferType:h=at}=e;this.isWebGLRenderer=!0;let g;if(r!==null){if(typeof WebGLRenderingContext<`u`&&r instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);g=r.getContextAttributes().alpha}else g=o;let _=h,v=new Set([ut,re,fe]),y=new Set([at,gt,Ke,Ve,st,Je]),b=new Uint32Array(4),x=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]},C=null,w=null,T=[],ee=[],D=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let O=this,k=!1,A=null,ne=null,ae=null,oe=null;this._outputColorSpace=E;let se=0,ce=0,le=null,M=-1,ue=null,de=new Ht,pe=new Ht,me=null,he=new N(0),ge=0,_e=t.width,ve=t.height,ye=1,be=null,xe=null,Se=new Ht(0,0,_e,ve),Ce=new Ht(0,0,_e,ve),we=!1,Te=new Me,Ee=new Pt,De=!1,Oe=!1,Ae=new ie,je=new H,P=new Ht,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function Fe(){return le===null?ye:1}let F=r;function Le(e,n){return t.getContext(e,n)}let Re,ze,I,Be,L,R,He,Ue,We,Ge,qe,z,Ye,B,Xe,Ze,Qe,$e,et,tt,nt,rt,it;try{let e={alpha:!0,depth:i,stencil:a,antialias:s,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,ct,!1),t.addEventListener(`webglcontextrestored`,lt,!1),t.addEventListener(`webglcontextcreationerror`,dt,!1),F===null){let t=`webgl2`;if(F=Le(t,e),F===null)throw Le(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ot()}catch(e){throw t.removeEventListener(`webglcontextlost`,ct,!1),t.removeEventListener(`webglcontextrestored`,lt,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),f(`WebGLRenderer: `+e.message),e}function ot(){Re=new jn(F),Re.init(),nt=new $i(F,Re),ze=new dn(F,Re,e,nt),I=new Zi(F,Re),ze.reversedDepthBuffer&&m&&I.buffers.depth.setReversed(!0),ne=F.createFramebuffer(),ae=F.createFramebuffer(),oe=F.createFramebuffer(),Be=new Pn(F),L=new ji,R=new Qi(F,Re,I,L,ze,nt,Be),He=new An(O),Ue=new nn(F),rt=new ln(F,Ue),We=new Mn(F,Ue,Be,rt),Ge=new In(F,We,Ue,rt,Be),$e=new Fn(F,ze,R),Xe=new fn(L),qe=new Ai(O,He,Re,ze,rt,Xe),z=new oa(O,L),Ye=new Fi,B=new Hi(Re),Qe=new cn(O,He,I,Ge,g,c),Ze=new Xi(O,Ge,ze),it=new sa(F,Be,ze,I),et=new un(F,Re,Be),tt=new Nn(F,Re,Be),Be.programs=qe.programs,O.capabilities=ze,O.extensions=Re,O.properties=L,O.renderLists=Ye,O.shadowMap=Ze,O.state=I,O.info=Be}_!==1009&&(D=new Rn(_,t.width,t.height,s,i,a));let V=new ra(O,F);this.xr=V,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Re.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ye},this.setPixelRatio=function(e){e!==void 0&&(ye=e,this.setSize(_e,ve,!1))},this.getSize=function(e){return e.set(_e,ve)},this.setSize=function(e,n,r=!0){V.isPresenting?j(`WebGLRenderer: Can't change size while VR device is presenting.`):(_e=e,ve=n,t.width=Math.floor(e*ye),t.height=Math.floor(n*ye),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),D!==null&&D.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(_e*ye,ve*ye).floor()},this.setDrawingBufferSize=function(e,n,r){_e=e,ve=n,ye=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(_===1009)f(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){j(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}D.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(de)},this.getViewport=function(e){return e.copy(Se)},this.setViewport=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),I.viewport(de.copy(Se).multiplyScalar(Fe()).round())},this.getScissor=function(e){return e.copy(Ce)},this.setScissor=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),I.scissor(pe.copy(Ce).multiplyScalar(Fe()).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(e){I.setScissorTest(we=e)},this.setOpaqueSort=function(e){be=e},this.setTransparentSort=function(e){xe=e},this.getClearColor=function(e){return e.copy(Qe.getClearColor())},this.setClearColor=function(){Qe.setClearColor(...arguments)},this.getClearAlpha=function(){return Qe.getClearAlpha()},this.setClearAlpha=function(){Qe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(le!==null){let t=le.texture.format;e=v.has(t)}if(e){let e=le.texture.type,t=y.has(e),n=Qe.getClearColor(),r=Qe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(b[0]=i,b[1]=a,b[2]=o,b[3]=r,F.clearBufferuiv(F.COLOR,0,b)):(x[0]=i,x[1]=a,x[2]=o,x[3]=r,F.clearBufferiv(F.COLOR,0,x))}else r|=F.COLOR_BUFFER_BIT}t&&(r|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&F.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),A=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ct,!1),t.removeEventListener(`webglcontextrestored`,lt,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),Qe.dispose(),Ye.dispose(),B.dispose(),R.dispose(),L.dispose(),He.dispose(),Ge.dispose(),We.dispose(),rt.dispose(),it.dispose(),qe.dispose(),V.dispose(),V.removeEventListener(`sessionstart`,yt),V.removeEventListener(`sessionend`,bt),xt.stop()};function ct(e){e.preventDefault(),n(`WebGLRenderer: Context Lost.`),k=!0}function lt(){n(`WebGLRenderer: Context Restored.`),k=!1;let e=Be.autoReset,t=Ze.enabled,r=Ze.autoUpdate,i=Ze.needsUpdate,a=Ze.type;ot(),Be.autoReset=e,Ze.enabled=t,Ze.autoUpdate=r,Ze.needsUpdate=i,Ze.type=a}function dt(e){f(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ft(e){let t=e.target;t.removeEventListener(`dispose`,ft),pt(t)}function pt(e){mt(e),L.remove(e)}function mt(e){let t=L.get(e).programs;t!==void 0&&(t.forEach(function(e){qe.releaseProgram(e)}),e.isShaderMaterial&&qe.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Mt(e,t,n,r,i);I.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=We.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;rt.setup(i,r,s,n,c);let h,g=et;if(c!==null&&(h=Ue.get(c),g=tt,g.setIndex(h)),i.isMesh)r.wireframe===!0?(I.setLineWidth(r.wireframeLinewidth*Fe()),g.setMode(F.LINES)):g.setMode(F.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),I.setLineWidth(e*Fe()),i.isLineSegments?g.setMode(F.LINES):i.isLineLoop?g.setMode(F.LINE_LOOP):g.setMode(F.LINE_STRIP)}else i.isPoints?g.setMode(F.POINTS):i.isSprite&&g.setMode(F.TRIANGLES);if(i.isBatchedMesh){if(Re.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ue.get(c).bytesPerElement:1,o=L.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(F,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ht(e,t,n,r){A!==null&&e.isNodeMaterial&&A.setObject(r,e),De===!0&&Xe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Ot(e,t,r),e.side=0,e.needsUpdate=!0,Ot(e,t,r),e.side=2):Ot(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),A!==null&&A.renderStart(e,t,n),w=B.get(n),w.init(t),ee.push(w),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(w.pushLight(e),e.castShadow&&w.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(w.pushLight(e),e.castShadow&&w.pushShadow(e))}),w.setupLights(),A!==null&&A.updateLights(w.state.lightsArray),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),De===!0&&Xe.setGlobalState(this.clippingPlanes,t),A!==null&&Ze.render(w.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ht(o,n,t,e),r.add(o)}else ht(i,n,t,e),r.add(i)}}),w=ee.pop(),A!==null&&A.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=L.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Re.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let _t=null;function vt(e){_t&&_t(e)}function yt(){xt.stop()}function bt(){xt.start()}let xt=new tn;xt.setAnimationLoop(vt),typeof self<`u`&&xt.setContext(self),this.setAnimationLoop=function(e){_t=e,V.setAnimationLoop(e),e===null?xt.stop():xt.start()},V.addEventListener(`sessionstart`,yt),V.addEventListener(`sessionend`,bt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){f(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(k===!0)return;A!==null&&A.renderStart(e,t);let n=V.enabled===!0&&V.isPresenting===!0,r=D!==null&&(le===null||n)&&D.begin(O,le);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(V.cameraAutoUpdate===!0&&V.updateCamera(t),t=V.getCamera()),e.isScene===!0&&e.onBeforeRender(O,e,t,le),w=B.get(e,ee.length),w.init(t),w.state.textureUnits=R.getTextureUnits(),ee.push(w),Ae.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?Ee.setFromArrayCamera(t):Te.setFromProjectionMatrix(Ae,Ie,t.reversedDepth),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),C=Ye.get(e,T.length),C.init(),T.push(C),this.info.render.frame++,V.enabled===!0&&V.isPresenting===!0){let e=O.xr.getDepthSensingMesh();e!==null&&St(e,t,-1/0,O.sortObjects)}St(e,t,0,O.sortObjects),C.finish(),A!==null&&A.updateLights(w.state.lightsArray),O.sortObjects===!0&&C.sort(be,xe),Pe=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Pe&&Qe.addToRenderList(C,e),this.info.autoReset===!0&&this.info.reset(),De===!0&&Xe.beginShadows();let i=w.state.shadowsArray;if(Ze.render(i,e,t),De===!0&&Xe.endShadows(),(r&&D.hasRenderPass())===!1){let n=C.opaque,r=C.transmissive;if(w.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];wt(n,r,e,a)}Pe&&Qe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];Ct(C,e,n,n.viewport)}}else r.length>0&&wt(n,r,e,t),Pe&&Qe.render(e),Ct(C,e,t)}le!==null&&ce===0&&(R.updateMultisampleRenderTarget(le),R.updateRenderTargetMipmap(le)),r&&D.end(O),e.isScene===!0&&e.onAfterRender(O,e,t),rt.resetDefaultState(),M=-1,ue=null,ee.pop(),ee.length>0?(w=ee[ee.length-1],R.setTextureUnits(w.state.textureUnits),De===!0&&Xe.setGlobalState(O.clippingPlanes,w.state.camera)):w=null,T.pop(),C=T.length>0?T[T.length-1]:null,A!==null&&A.renderEnd()};function St(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)w.pushLight(e),e.castShadow&&w.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?Ee:Te;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&P.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Ae);let i=Ge.update(e),a=e.material;a.visible&&C.push(e,i,a,n,P.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?Ee:Te;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ge.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),P.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),P.copy(e.boundingSphere.center)),P.applyMatrix4(e.matrixWorld).applyMatrix4(Ae)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&C.push(e,i,c,n,P.z,s,t)}}else a.visible&&C.push(e,i,a,n,P.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)St(i[e],t,n,r)}function Ct(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;w.setupLightsView(n),De===!0&&Xe.setGlobalState(O.clippingPlanes,n),r&&I.viewport(de.copy(r)),i.length>0&&Tt(i,t,n),a.length>0&&Tt(a,t,n),o.length>0&&Tt(o,t,n),I.buffers.depth.setTest(!0),I.buffers.depth.setMask(!0),I.buffers.color.setMask(!0),I.setPolygonOffset(!1)}function wt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[r.id]===void 0){let e=Re.has(`EXT_color_buffer_half_float`)||Re.has(`EXT_color_buffer_float`);w.state.transmissionRenderTarget[r.id]=new zt(1,1,{generateMipmaps:!0,type:e?Bt:at,minFilter:p,samples:Math.max(4,ze.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ke.workingColorSpace})}let i=w.state.transmissionRenderTarget[r.id],o=r.viewport||de;i.setSize(o.z*O.transmissionResolutionScale,o.w*O.transmissionResolutionScale);let s=O.getRenderTarget(),c=O.getActiveCubeFace(),l=O.getActiveMipmapLevel();O.setRenderTarget(i),O.getClearColor(he),ge=O.getClearAlpha(),ge<1&&O.setClearColor(16777215,.5),O.clear(),Pe&&Qe.render(n);let u=O.toneMapping;O.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),w.setupLightsView(r),De===!0&&Xe.setGlobalState(O.clippingPlanes,r),Tt(e,n,r),R.updateMultisampleRenderTarget(i),R.updateRenderTargetMipmap(i),Re.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Et(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(R.updateMultisampleRenderTarget(i),R.updateRenderTargetMipmap(i))}O.setRenderTarget(s,c,l),O.setClearColor(he,ge),d!==void 0&&(r.viewport=d),O.toneMapping=u}function Tt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Et(o,t,n,s,l,c)}}function Et(e,t,n,r,i,a){A!==null&&i.isNodeMaterial&&A.setObject(e,i),e.onBeforeRender(O,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(O,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,O.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,O.renderBufferDirect(n,t,r,i,e,a),i.side=2):O.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(O,t,n,r,i,a)}function Dt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Ot(e,t,n){t.isScene!==!0&&(t=Ne);let r=L.get(e),i=w.state.lights,a=w.state.shadowsArray,o=i.state.version,s=qe.getParameters(e,i.state,a,t,n,w.state.lightProbeGridArray),c=qe.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=He.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ft),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return jt(e,s),d}else s.uniforms=qe.getUniforms(e),A!==null&&e.isNodeMaterial&&A.build(e,n,s),e.onBeforeCompile(s,O),d=qe.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Xe.uniform),jt(e,s),r.needsLights=Ft(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=Dt(w.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function kt(e,t,n,r,i){let a=L.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Ot(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function At(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=qr.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function jt(e,t){let n=L.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Mt(e,t,n,r,i){t.isScene!==!0&&(t=Ne),R.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=le===null?O.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:ke.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=He.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(h=O.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=L.get(r),y=w.state.lights;if(De===!0&&(Oe===!0||e!==ue)){let t=e===ue&&r.id===M;Xe.setState(r,e,t)}let b=!1,x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Xe.numPlanes||v.numIntersection!==Xe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===Dt(w.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(x=!0):b=!0:b=!0:(b=!0,v.__version=r.version);let C=v.currentProgram;(b===!0||x===!0)&&(C=x===!0?kt(r,t,i,s,h):Ot(r,t,i),A&&r.isNodeMaterial&&A.onUpdateProgram(r,C,v));let T=!1,E=!1,ee=!1,D=C.getUniforms(),k=v.uniforms;if(I.useProgram(C.program)&&(T=!0,E=!0,ee=!0),r.id!==M&&(M=r.id,E=!0),T||ue!==e){I.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),D.setValue(F,`projectionMatrix`,e.projectionMatrix),D.setValue(F,`viewMatrix`,e.matrixWorldInverse);let t=D.map.cameraPosition;t!==void 0&&t.setValue(F,je.setFromMatrixPosition(e.matrixWorld)),ze.logarithmicDepthBuffer&&D.setValue(F,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&D.setValue(F,`isOrthographic`,e.isOrthographicCamera===!0),ue!==e&&(ue=e,E=!0,ee=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&D.setValue(F,`sunShadowMap`,y.state.sunShadowMap,R),y.state.directionalShadowMap.length>0&&D.setValue(F,`directionalShadowMap`,y.state.directionalShadowMap,R),y.state.spotShadowMap.length>0&&D.setValue(F,`spotShadowMap`,y.state.spotShadowMap,R),y.state.pointShadowMap.length>0&&D.setValue(F,`pointShadowMap`,y.state.pointShadowMap,R)),i.isSkinnedMesh){D.setOptional(F,i,`bindMatrix`),D.setOptional(F,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),D.setValue(F,`boneTexture`,e.boneTexture,R))}i.isBatchedMesh&&(D.setOptional(F,i,`batchingTexture`),D.setValue(F,`batchingTexture`,i._matricesTexture,R),D.setOptional(F,i,`batchingIdTexture`),D.setValue(F,`batchingIdTexture`,i._indirectTexture,R),D.setOptional(F,i,`batchingColorTexture`),i._colorsTexture!==null&&D.setValue(F,`batchingColorTexture`,i._colorsTexture,R));let te=n.morphAttributes;if((te.position!==void 0||te.normal!==void 0||te.color!==void 0)&&$e.update(i,n,C),(E||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,D.setValue(F,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=ua()),E){if(D.setValue(F,`toneMappingExposure`,O.toneMappingExposure),v.needsLights&&Nt(k,ee),a&&r.fog===!0&&z.refreshFogUniforms(k,a),z.refreshMaterialUniforms(k,r,ye,ve,w.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=S,t=0;for(let n of w.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;k.probesSH.value=e.textures,k.probesMin.value=e.min,k.probesMax.value=e.max,k.probesResolution.value=e.resolution}qr.upload(F,At(v),k,R)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(qr.upload(F,At(v),k,R),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&D.setValue(F,`center`,i.center),D.setValue(F,`modelViewMatrix`,i.modelViewMatrix),D.setValue(F,`normalMatrix`,i.normalMatrix),D.setValue(F,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];it.update(n,C),it.bind(n,C)}}return C}function Nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Ft(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return se},this.getActiveMipmapLevel=function(){return ce},this.getRenderTarget=function(){return le},this.setRenderTargetTextures=function(e,t,n){let r=L.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),L.get(e.texture).__webglTexture=t,L.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=L.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){le=e,se=t,ce=n;let r=null,i=!1,a=!1;if(e){let o=L.get(e);if(o.__useDefaultFramebuffer!==void 0){I.bindFramebuffer(F.FRAMEBUFFER,o.__webglFramebuffer),de.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest,I.viewport(de),I.scissor(pe),I.setScissorTest(me),M=-1;return}if(o.__webglFramebuffer===void 0)R.setupRenderTarget(e);else if(o.__hasExternalTextures)R.rebindTextures(e,L.get(e.texture).__webglTexture,L.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&L.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);R.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=L.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&R.useMultisampledRTT(e)===!1?L.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,de.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest}else de.copy(Se).multiplyScalar(ye).floor(),pe.copy(Ce).multiplyScalar(ye).floor(),me=we;if(n!==0&&(r=ne),I.bindFramebuffer(F.FRAMEBUFFER,r)&&I.drawBuffers(e,r),I.viewport(de),I.scissor(pe),I.setScissorTest(me),i){let r=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=L.get(e.textures[t]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,t.__webglTexture,n)}M=-1};function Lt(e){let t=L.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=ze.textureFormatReadable(e.format),t.__typeReadable=ze.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){f(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){I.bindFramebuffer(F.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let u=Lt(o);if(u.__formatReadable===!1){f(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){f(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&F.readPixels(t,n,r,i,nt.convert(c),nt.convert(l),a)}finally{let e=le===null?null:L.get(le).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){I.bindFramebuffer(F.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s);let d=Lt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.bufferData(F.PIXEL_PACK_BUFFER,a.byteLength,F.STREAM_READ),F.readPixels(t,n,r,i,nt.convert(l),nt.convert(u),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let p=le===null?null:L.get(le).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,p);let m=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await te(F,m,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,f),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,a),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(f),F.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;R.setTexture2D(e,0),F.copyTexSubImage2D(F.TEXTURE_2D,n,0,0,o,s,i,a),I.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=nt.convert(t.format),_=nt.convert(t.type),v;t.isData3DTexture?(R.setTexture3D(t,0),v=F.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(R.setTexture2DArray(t,0),v=F.TEXTURE_2D_ARRAY):(R.setTexture2D(t,0),v=F.TEXTURE_2D),I.activeTexture(F.TEXTURE0),I.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(F.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(F.UNPACK_ROW_LENGTH),b=I.getParameter(F.UNPACK_IMAGE_HEIGHT),x=I.getParameter(F.UNPACK_SKIP_PIXELS),S=I.getParameter(F.UNPACK_SKIP_ROWS),C=I.getParameter(F.UNPACK_SKIP_IMAGES);I.pixelStorei(F.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(F.UNPACK_SKIP_PIXELS,l),I.pixelStorei(F.UNPACK_SKIP_ROWS,u),I.pixelStorei(F.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=L.get(e),r=L.get(t),h=L.get(n.__renderTarget),g=L.get(r.__renderTarget);I.bindFramebuffer(F.READ_FRAMEBUFFER,h.__webglFramebuffer),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(e).__webglTexture,i,d+n),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(t).__webglTexture,a,m+n)),F.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,F.DEPTH_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||L.has(e)){let n=L.get(e),r=L.get(t);I.bindFramebuffer(F.READ_FRAMEBUFFER,ae),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,oe);for(let e=0;e<c;e++)w?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,n.__webglTexture,i),T?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,r.__webglTexture,a),i===0?T?F.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):F.copyTexSubImage2D(v,a,f,p,l,u,o,s):F.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,F.COLOR_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?F.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(F.UNPACK_ROW_LENGTH,y),I.pixelStorei(F.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(F.UNPACK_SKIP_PIXELS,x),I.pixelStorei(F.UNPACK_SKIP_ROWS,S),I.pixelStorei(F.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&F.generateMipmap(v),I.unbindTexture()},this.initRenderTarget=function(e){L.get(e).__webglFramebuffer===void 0&&R.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?R.setTextureCube(e,0):e.isData3DTexture?R.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?R.setTexture2DArray(e,0):R.setTexture2D(e,0),I.unbindTexture()},this.resetState=function(){se=0,ce=0,le=null,I.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ie}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=ke._getUnpackColorSpace()}},fa=class{static isWebGL2Available(){try{let e=document.createElement(`canvas`);return!!(window.WebGL2RenderingContext&&e.getContext(`webgl2`))}catch{return!1}}static isColorSpaceAvailable(e){try{let t=document.createElement(`canvas`),n=window.WebGL2RenderingContext&&t.getContext(`webgl2`);return n.drawingBufferColorSpace=e,n.drawingBufferColorSpace===e}catch{return!1}}static getWebGL2ErrorMessage(){return this._getErrorMessage(2)}static _getErrorMessage(e){let t={1:`WebGL`,2:`WebGL 2`},n={1:window.WebGLRenderingContext,2:window.WebGL2RenderingContext},r=`Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>`,i=document.createElement(`div`);return i.id=`webglmessage`,i.style.fontFamily=`monospace`,i.style.fontSize=`13px`,i.style.fontWeight=`normal`,i.style.textAlign=`center`,i.style.background=`#fff`,i.style.color=`#000`,i.style.padding=`1.5em`,i.style.width=`400px`,i.style.margin=`5em auto 0`,r=n[e]?r.replace(`$0`,`graphics card`):r.replace(`$0`,`browser`),r=r.replace(`$1`,t[e]),i.innerHTML=r,i}},pa=`
vec2 rippleSlope(vec2 p, float t) {
  vec2 s = vec2(0.0);
  ${Array.from({length:7},(e,t)=>{let n=(96+(t%2?1:-1)*(12+t*9))*Math.PI/180,r=.55+t*.17,i=2*Math.PI/r;return{dx:Math.cos(n),dz:Math.sin(n),k:i,speed:.3*Math.sqrt(9.8*i),slope:.11-t*.008}}).map(e=>`s += vec2(${e.dx.toFixed(4)}, ${e.dz.toFixed(4)}) * (${e.slope.toFixed(4)} * cos(dot(vec2(${e.dx.toFixed(4)}, ${e.dz.toFixed(4)}), p) * ${e.k.toFixed(4)} + t * ${e.speed.toFixed(4)}));`).join(`
  `)}
  return s;
}
`,ma=`
uniform float uTime;
varying vec3 vWorld;
#include <fog_pars_vertex>
${m}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  world.y += waveHeight(world.xz, uTime);
  vWorld = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,ha=`
uniform float uTime;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec4 uIslands[64];
uniform int uIslandCount;
varying vec3 vWorld;
#include <fog_pars_fragment>
${m}
${pa}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 p = vWorld.xz;
  vec3 viewDir = normalize(cameraPosition - vWorld);
  // Ripples fade out with distance before they alias into shimmer.
  float near = 1.0 - smoothstep(22.0, 40.0, length(cameraPosition - vWorld));

  // Slopes are exaggerated for shading only, so the swell shows without
  // making the waves (and everything floating on them) taller.
  vec3 n = waveNormal(p, uTime);
  vec2 slope = vec2(n.x, n.z) * 3.0 - rippleSlope(p, uTime) * near;
  n = normalize(vec3(slope.x, n.y, slope.y));
  float h = waveHeight(p, uTime);

  // Open water darkens in broad, slowly drifting patches, like depth changing
  // under the surface; the light turquoise is kept for the shallows.
  float depth = valueNoise(p * 0.06 + vec2(uTime * 0.004, 0.0)) * 0.65 + valueNoise(p * 0.15 - vec2(0.0, uTime * 0.006)) * 0.35;
  vec3 open = mix(uDeep * 1.12, uDeep * vec3(0.62, 0.74, 0.86), depth);

  // Color comes mostly from lighting the swell; height only lifts the crests a
  // touch, since strong height tinting reads as blotches sliding past on scroll.
  float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 3.0);
  vec3 color = mix(open, uShallow, clamp(0.12 + h * 2.0 + fresnel * 0.45, 0.0, 1.0));

  // Shallows and surf around each island.
  float surf = 0.0;
  float shallow = 0.0;
  for (int i = 0; i < 64; i++) {
    if (i >= uIslandCount) break;
    vec4 isl = uIslands[i];
    float d = length(p - isl.xy) - isl.z;
    shallow = max(shallow, smoothstep(2.2, 0.0, d));
    float ring = smoothstep(0.45, 0.0, d) * (0.55 + 0.45 * sin(d * 18.0 - uTime * 2.6 + isl.w));
    surf = max(surf, ring * step(-0.2, d));
  }
  color = mix(color, uShallow * 1.05, shallow * 0.8);

  float diffuse = clamp(dot(n, uSunDir), 0.0, 1.0);
  color *= 0.78 + 0.3 * diffuse;
  vec3 halfVec = normalize(uSunDir + viewDir);
  float spec = pow(max(dot(n, halfVec), 0.0), 220.0);
  color += uSunColor * spec * 0.7;

  color = mix(color, uFoam, surf * 0.75);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`,ga=class{mesh;islands=Array.from({length:64},()=>new Ht);constructor(e){let t=new bt(140,160,e,e);t.rotateX(-Math.PI/2);let n=new De({vertexShader:ma,fragmentShader:ha,fog:!0,uniforms:ze.merge([W.fog,{uTime:{value:0},uShallow:{value:null},uDeep:{value:null},uFoam:{value:null},uSunDir:{value:new H(.4,.8,.3).normalize()},uSunColor:{value:null},uIslands:{value:this.islands},uIslandCount:{value:0}}])});this.mesh=new M(t,n),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-1}setIslands(e){e.slice(0,64).forEach((e,t)=>{this.islands[t].set(e.x,e.z,e.radius,t*1.7)}),this.mesh.material.uniforms.uIslandCount.value=Math.min(e.length,64)}setColors(e,t,n,r){let i=this.mesh.material.uniforms;i.uShallow.value=e,i.uDeep.value=t,i.uFoam.value=n,i.uSunColor.value=r}setSunDirection(e){this.mesh.material.uniforms.uSunDir.value.copy(e).normalize()}follow(e,t){this.mesh.position.set(0,0,Math.round(e)-30),this.mesh.material.uniforms.uTime.value=t}},_a=new be(-1,1,1,-1,0,1),va=new class extends v{constructor(){super(),this.setAttribute(`position`,new ct([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new ct([0,2,0,0,2,0],2))}},ya=class{constructor(e){this._mesh=new M(va,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,_a)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},ba={value:0},xa=ba,Sa={value:0},Ca=`
float texHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float texNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(texHash(i), texHash(i + vec3(1, 0, 0)), f.x), mix(texHash(i + vec3(0, 1, 0)), texHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(texHash(i + vec3(0, 0, 1)), texHash(i + vec3(1, 0, 1)), f.x), mix(texHash(i + vec3(0, 1, 1)), texHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
vec3 groundPatches(vec3 P) {
  // Only broad, soft patches: finer noise reads as grit at this scale.
  float soft = texNoise(P * 3.5 + 7.3);
  float shade = 1.0 + (soft - 0.5) * 0.16;
  // Sun-bleached patches on the high spots, lusher, cooler hollows in between.
  vec3 tint = mix(vec3(0.95, 0.99, 0.94), vec3(1.0), smoothstep(0.3, 0.5, soft));
  tint = mix(tint, vec3(1.06, 1.03, 0.9), smoothstep(0.6, 0.85, soft));
  return tint * shade;
}`,wa=new pe({vertexColors:!0,roughness:.78,metalness:0,side:2});wa.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute float aTex;
varying float vTex;
varying vec3 vLocal;
varying vec3 vObjNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vTex = aTex;
vLocal = position;
vObjNormal = normal;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying float vTex;
varying vec3 vLocal;
varying vec3 vObjNormal;
${Ca}`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  vec3 P = vLocal;
  float big = texNoise(P * 6.0);
  float fine = texNoise(P * 34.0);
  float up = abs(normalize(vObjNormal).y);
  float shade = 1.0;
  vec3 tint = vec3(1.0);
  if (vTex < 0.5) {
    shade = 1.0 + (fine - 0.5) * 0.05;
  } else if (vTex < 1.5) {
    tint = groundPatches(P);
    shade = mix(0.8, 1.0, smoothstep(0.3, 0.85, up));
  } else if (vTex < 2.5) {
    float band = sin(P.y * 55.0 + big * 4.0) * 0.5 + 0.5;
    shade = 0.9 + band * 0.13 + (fine - 0.5) * 0.14;
    shade *= mix(0.78, 1.0, smoothstep(-0.25, 0.3, P.y));
  } else {
    float strata = sin(P.y * 34.0 + big * 5.0) * 0.5 + 0.5;
    shade = 0.88 + strata * 0.11 + (fine - 0.5) * 0.2;
    shade *= mix(1.0, 1.07, smoothstep(0.6, 0.95, up));
  }
  diffuseColor.rgb *= shade * tint;
}`)};var Ta=new pe({vertexColors:!0,roughness:.25,metalness:.1,emissive:new N(`#ffc76b`),emissiveIntensity:0}),Ea=`
uniform float uTime;
varying vec3 vWater;
varying vec3 vLocal;
varying vec3 vObjNormal;
float wHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float wNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wHash(i), wHash(i + vec2(1.0, 0.0)), f.x), mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
/** Ripple coordinates: downstream for rivers, a slow drift for still water. */
vec2 rippleUV(float scale) {
  float across = (vLocal.x + vLocal.z) * scale;
  if (vWater.y > 0.0) return vec2(vWater.x * scale - uTime * vWater.y * 2.2, across);
  return vLocal.xz * scale + vec2(uTime * 0.35, -uTime * 0.25);
}`,Da=new pe({vertexColors:!0,roughness:.14,metalness:0,side:2});Da.onBeforeCompile=e=>{e.uniforms.uTime=ba,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec3 aWater;
varying vec3 vWater;
varying vec3 vLocal;
varying vec3 vObjNormal;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vWater = aWater;
vLocal = position;
vObjNormal = normal;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${Ea}`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  float edge = vWater.z;
  float speed = vWater.y;
  // White water only where a fast stream actually drops, not on the flat run-up to the lip.
  float steep = 1.0 - abs(normalize(vObjNormal).y);
  float fall = step(0.001, speed) * smoothstep(0.2, 0.55, steep);
  vec3 base = diffuseColor.rgb;
  vec3 deep = base * vec3(0.6, 0.74, 0.88);
  vec3 shallow = mix(base, vec3(0.5, 0.92, 0.86), 0.4) * 1.1;
  vec3 col = mix(shallow, deep, smoothstep(0.05, 0.85, edge));
  // Broken foam along the banks.
  float wob = wNoise(vLocal.xz * 46.0 + uTime * 0.6);
  float shore = (1.0 - smoothstep(0.0, 0.1 + wob * 0.08, edge)) * 0.8;
  // Fine streaks moving downstream, kept off the banks.
  float streak = 0.0;
  if (speed > 0.0) {
    float n = wNoise(vec2(vWater.x * 16.0 - uTime * speed * 3.0, (vLocal.x + vLocal.z) * 11.0));
    streak = smoothstep(0.7, 0.95, n) * 0.28 * smoothstep(0.15, 0.6, edge);
  }
  // White water down a fall.
  float white = fall * (0.5 + 0.4 * smoothstep(0.35, 0.85, wNoise(vec2(vWater.x * 34.0 - uTime * speed * 5.0, (vLocal.x + vLocal.z) * 30.0))));
  diffuseColor.rgb = mix(col, vec3(1.0), clamp(shore + streak + white, 0.0, 1.0));
}`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
{
  vec2 q = rippleUV(26.0);
  float e = 0.06;
  float h0 = wNoise(q) + 0.5 * wNoise(q * 2.3 + 7.1);
  float hx = wNoise(q + vec2(e, 0.0)) + 0.5 * wNoise((q + vec2(e, 0.0)) * 2.3 + 7.1);
  float hz = wNoise(q + vec2(0.0, e)) + 0.5 * wNoise((q + vec2(0.0, e)) * 2.3 + 7.1);
  vec3 bump = vec3(h0 - hx, 0.0, h0 - hz) / e * 0.045;
  normal = normalize(normal + (viewMatrix * vec4(bump, 0.0)).xyz);
}`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
{
  float fres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 4.0);
  totalEmissiveRadiance += vec3(0.72, 0.88, 1.0) * fres * 0.3 * (1.0 - step(0.001, vWater.y) * smoothstep(0.2, 0.55, 1.0 - abs(normalize(vObjNormal).y)));
}`)};var Oa={solid:wa,glass:Ta,water:Da};function ka(e,t){ba.value=e,Sa.value=t,Ta.emissiveIntensity=t*1.2}var Aa=[{id:`none`,label:`Standard`},{id:`pixel`,label:`Pixel art`},{id:`anime`,label:`Cozy anime`},{id:`toy`,label:`Miniature toy`}];function ja(){let e=new URLSearchParams(window.location.search).get(`style`);return Aa.some(t=>t.id===e)?e:`toy`}var Ma=4,Na=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,Pa=`
#include <packing>
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 uTexel;
uniform float uNear;
uniform float uFar;
varying vec2 vUv;

/** Inverse view depth: linear in screen space across any flat surface. */
float invDepth(vec2 uv) {
  return 1.0 / -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar);
}

/**
 * How strongly this pixel sits on the near side of a silhouette, from the
 * Laplacian of inverse depth. Flat or gently curved surfaces (the ocean at a
 * grazing angle included) give ~0.
 */
float silhouette(vec2 uv, vec2 step) {
  float c = invDepth(uv);
  float lap = invDepth(uv + vec2(step.x, 0.0)) + invDepth(uv - vec2(step.x, 0.0))
            + invDepth(uv + vec2(0.0, step.y)) + invDepth(uv - vec2(0.0, step.y)) - 4.0 * c;
  return max(-lap, 0.0) / c;
}

vec3 saturate3(vec3 c, float amount) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return max(mix(vec3(l), c, amount), 0.0);
}`,Fa=`
${Pa}
uniform vec2 uRes;

float bayer4(vec2 p) {
  vec2 q = mod(floor(p), 4.0);
  float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  return m[int(q.y * 4.0 + q.x)] / 16.0;
}

void main() {
  vec3 c = texture2D(tColor, vUv).rgb;
  c = saturate3(c, 1.2);
  // Dark outline on the near side of every silhouette, one art pixel wide.
  float edge = step(0.008, silhouette(vUv, uTexel));
  c *= 1.0 - edge * 0.5;
  // A limited palette: posterize in display space with a light ordered dither.
  vec3 s = pow(c, vec3(1.0 / 2.2));
  float levels = 8.0;
  s = floor(s * levels + bayer4(vUv * uRes) * 0.5 + 0.25) / levels;
  gl_FragColor = vec4(pow(clamp(s, 0.0, 1.0), vec3(2.2)), 1.0);
  #include <colorspace_fragment>
}`,Ia=`
${Pa}
uniform float uLine;

void main() {
  vec3 c = texture2D(tColor, vUv).rgb;
  float l = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-4);

  // Cel shading: snap brightness to a few soft-edged bands, keeping each pixel's hue.
  float ls = pow(l, 1.0 / 2.2) * 4.0;
  float band = (floor(ls) + smoothstep(0.3, 0.7, fract(ls))) / 4.0;
  c *= pow(band, 2.2) / l;
  // Shadows lean cool and lavender, lit areas warm, like painted backgrounds.
  float shade = 1.0 - smoothstep(0.2, 0.5, band);
  c = mix(c * vec3(1.05, 1.02, 0.95), c * vec3(0.84, 0.86, 1.12), shade * 0.5);
  c = saturate3(c, 1.18);

  // A soft glow around bright areas.
  vec3 glow = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    vec2 o = vec2(cos(a), sin(a)) * uTexel * 7.0 * uLine;
    glow += max(texture2D(tColor, vUv + o).rgb - 0.55, 0.0);
  }
  c += glow / 8.0 * 0.6;

  // Thin ink lines.
  float edge = smoothstep(0.003, 0.009, silhouette(vUv, uTexel * uLine));
  c = mix(c, vec3(0.13, 0.1, 0.16), edge * 0.8);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`,La=`
${Pa}
uniform float uBlur;
uniform vec2 uAspect;

void main() {
  vec3 sharp = texture2D(tColor, vUv).rgb;
  // Tilt-shift: in focus across the middle band, blurring toward the top and bottom.
  float amount = smoothstep(0.1, 0.48, abs(vUv.y - 0.5));
  float radius = mix(1.5, uBlur, amount);
  vec3 sum = vec3(0.0);
  float golden = 2.39996;
  for (int i = 0; i < 20; i++) {
    float r = sqrt((float(i) + 0.5) / 20.0);
    float a = float(i) * golden;
    sum += texture2D(tColor, vUv + vec2(cos(a), sin(a)) * r * radius * uTexel).rgb;
  }
  vec3 soft = sum / 20.0;
  vec3 c = mix(sharp, soft, amount);
  // Glossy plastic bloom on highlights.
  c += max(soft - 0.6, 0.0) * 0.5;

  // Bright, saturated, slightly contrasty, like painted plastic under studio light.
  c = saturate3(c, 1.35);
  c = pow(c, vec3(1.08)) * 1.1;
  c *= vec3(1.03, 1.0, 0.97);
  float v = length((vUv - 0.5) * uAspect);
  c *= 1.0 - smoothstep(0.45, 1.0, v) * 0.35;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;function Ra(e,t={}){return new De({vertexShader:Na,fragmentShader:e,depthTest:!1,depthWrite:!1,uniforms:{tColor:{value:null},tDepth:{value:null},uTexel:{value:new P},uNear:{value:.1},uFar:{value:100},...t}})}var za=class{renderer;style=`none`;target=null;quad=new ya;materials={pixel:Ra(Fa,{uRes:{value:new P}}),anime:Ra(Ia,{uLine:{value:1}}),toy:Ra(La,{uBlur:{value:10},uAspect:{value:new P(1,1)}})};size=new P;roughness=Oa.solid.roughness;constructor(e){this.renderer=e}get current(){return this.style}setStyle(e){this.style=e,Oa.solid.roughness=e===`toy`?.42:this.roughness,this.rebuildTarget()}resize(){this.rebuildTarget()}rebuildTarget(){if(this.target?.depthTexture?.dispose(),this.target?.dispose(),this.target=null,this.style===`none`)return;this.renderer.getDrawingBufferSize(this.size);let e=this.style===`pixel`,t=this.renderer.getPixelRatio(),n=e?Math.max(1,Math.floor(this.size.x/(Ma*t))):this.size.x,r=e?Math.max(1,Math.floor(this.size.y/(Ma*t))):this.size.y,i=e?a:ye;this.target=new zt(n,r,{type:Bt,minFilter:i,magFilter:i,samples:e?0:4,depthTexture:new I(n,r)});let o=this.materials[this.style];o.uniforms.tColor.value=this.target.texture,o.uniforms.tDepth.value=this.target.depthTexture,o.uniforms.uTexel.value.set(1/n,1/r),this.style===`pixel`&&o.uniforms.uRes.value.set(n,r),this.style===`anime`&&(o.uniforms.uLine.value=Math.max(1,t*.75)),this.style===`toy`&&(o.uniforms.uBlur.value=9*t,o.uniforms.uAspect.value.set(n/r,1))}render(e,t){if(!this.target||this.style===`none`){t.layers.enable(1),this.renderer.render(e,t);return}t.layers.disable(1);let n=this.materials[this.style],r=t;n.uniforms.uNear.value=r.near,n.uniforms.uFar.value=r.far,this.renderer.setRenderTarget(this.target),this.renderer.render(e,t),this.renderer.setRenderTarget(null),this.quad.material=n,this.quad.render(this.renderer);let i=t.layers.mask,a=this.renderer.autoClear,o=e.background;e.background=null,t.layers.set(1),this.renderer.autoClear=!1,this.renderer.clearDepth(),this.renderer.render(e,t),this.renderer.autoClear=a,e.background=o,t.layers.mask=i}},Ba={waterShallow:new N(`#7fe6ef`),waterDeep:new N(`#1b9cc0`),foam:new N(`#ffffff`),fog:new N(`#4dd0e1`),hemiSky:new N(`#ffffff`),hemiGround:new N(`#4dd0e1`),hemiIntensity:1.6,sun:new N(`#fff4e0`),sunIntensity:2.2,spriteTint:new N(`#ffffff`),routeOpacity:.55},Va={waterShallow:new N(`#1f5a78`),waterDeep:new N(`#0b1c3c`),foam:new N(`#a9b8ff`),fog:new N(`#121332`),hemiSky:new N(`#8f9cff`),hemiGround:new N(`#0f1a3a`),hemiIntensity:.55,sun:new N(`#b8c4ff`),sunIntensity:.6,spriteTint:new N(`#7f86c8`),routeOpacity:.35},Ha=class{current=Ua(Ba);night=!1;t=0;constructor(e){this.night=e,this.t=+!!e,this.apply()}update(e){let t=+!!this.night;if(this.t===t)return!1;let n=e/.8;return this.t=t>this.t?Math.min(t,this.t+n):Math.max(t,this.t-n),this.apply(),!0}get blend(){return this.t}apply(){let e=this.current,t=this.t*this.t*(3-2*this.t);for(let n of Object.keys(Ba)){let r=Ba[n],i=Va[n];r instanceof N&&i instanceof N?e[n].copy(r).lerp(i,t):e[n]=r+(i-r)*t}}};function Ua(e){let t={};for(let[n,r]of Object.entries(e))t[n]=r instanceof N?r.clone():r;return t}var Wa=et.degToRad(45),Ga=38,Ka=class{spacer;renderer;fx;scene=new w;camera=new _(Ga,1,.5,200);ocean;theme;hemi;sun;sunDir=new H(-.35,.85,.4).normalize();focus=new H;distance=20;scrollStartZ=0;scrollEndZ=0;pxPerUnit=40;clock=new Ee;updatables=[];raycaster=new x;ndc=new P;elapsed=0;paused=!1;constructor(e,t,n){this.spacer=t,this.renderer=new da({canvas:e,antialias:!0,powerPreference:`high-performance`}),this.renderer.outputColorSpace=E,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,O?1.75:2)),this.fx=new za(this.renderer),this.theme=new Ha(n);let r=this.theme.current;this.scene.background=r.fog,this.scene.fog=new qe(r.fog,30,70),this.hemi=new ge(r.hemiSky,r.hemiGround,r.hemiIntensity),this.sun=new ot(r.sun,r.sunIntensity),this.sun.position.copy(this.sunDir).multiplyScalar(30),this.scene.add(this.hemi,this.sun,this.sun.target),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2,this.sun.castShadow=!0,this.sun.shadow.mapSize.setScalar(O?1024:2048),this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.02,this.ocean=new ga(O?96:160),this.ocean.setColors(r.waterShallow,r.waterDeep,r.foam,r.sun),this.ocean.setSunDirection(this.sunDir),this.scene.add(this.ocean.mesh)}applyTheme(){let e=this.theme.current;this.scene.fog.color.copy(e.fog),this.hemi.color.copy(e.hemiSky),this.hemi.groundColor.copy(e.hemiGround),this.hemi.intensity=e.hemiIntensity,this.sun.color.copy(e.sun),this.sun.intensity=e.sunIntensity}get time(){return this.elapsed}onUpdate(e){this.updatables.push(e)}add(...e){this.scene.add(...e)}configureView(e,t,n){let r=window.innerWidth,i=window.innerHeight;this.renderer.setSize(r,i,!1),this.fx.resize(),this.camera.aspect=r/i,this.camera.updateProjectionMatrix();let a=Math.atan(Math.tan(et.degToRad(Ga/2))*this.camera.aspect);this.distance=et.clamp(e*1.04/Math.tan(a),12,46),this.scrollStartZ=this.solveFocusFor(t,Qe()?.62:.74),this.scrollEndZ=Math.max(this.scrollStartZ,this.solveFocusFor(n,-.15)),this.placeCamera(this.scrollStartZ);let o=this.tmp.set(0,0,this.scrollStartZ).project(this.camera).y,s=this.tmp.set(0,0,this.scrollStartZ+1).project(this.camera).y;this.pxPerUnit=Math.abs(o-s)*.5*i;let c=(this.scrollEndZ-this.scrollStartZ)*this.pxPerUnit;this.spacer.style.height=`${Math.ceil(c+i)}px`;let l=this.visibleBounds(),u=this.sun.shadow.camera,d=(l.maxZ-l.minZ)/2;this.shadowCenterZ=(l.minZ+l.maxZ)/2-this.focus.z,u.left=-(l.halfX+1.5),u.right=l.halfX+1.5,u.top=d+1.5,u.bottom=-(d+1.5),u.near=1,u.far=80,u.updateProjectionMatrix(),this.syncScroll()}shadowCenterZ=0;scrollYFor(e){return(et.clamp(e,this.scrollStartZ,this.scrollEndZ)-this.scrollStartZ)*this.pxPerUnit}syncScroll(){let e=this.scrollStartZ+window.scrollY/this.pxPerUnit;this.placeCamera(et.clamp(e,this.scrollStartZ,this.scrollEndZ))}visibleBounds(){let e=Math.atan(Math.tan(et.degToRad(Ga/2))*this.camera.aspect),t=Math.tan(e)*this.distance,n=this.distance*Math.tan(et.degToRad(Ga/2))/Math.sin(Wa);return{halfX:t,minZ:this.focus.z-n*1.3,maxZ:this.focus.z+n*.9}}edgeA=new H;edgeB=new H;waterHalfXAt(e){this.camera.updateMatrixWorld();let t=this.ndcOnWater(1,-1,this.edgeA),n=this.ndcOnWater(1,.98,this.edgeB);if(!t||!n||Math.abs(n.z-t.z)<1e-6)return this.visibleBounds().halfX;let r=(e-t.z)/(n.z-t.z);return Math.max(t.x+(n.x-t.x)*r,0)}ndcOnWater(e,t,n){this.ndc.set(e,t),this.raycaster.setFromCamera(this.ndc,this.camera);let r=this.raycaster.ray;if(r.direction.y>=0)return null;let i=-r.origin.y/r.direction.y;return n.copy(r.origin).addScaledVector(r.direction,i)}raycast(e,t,n){return this.ndc.set(e/window.innerWidth*2-1,-(t/window.innerHeight)*2+1),this.raycaster.setFromCamera(this.ndc,this.camera),this.raycaster.intersectObjects(n,!0)[0]??null}pickWater(e,t,n){this.ndc.set(e/window.innerWidth*2-1,-(t/window.innerHeight)*2+1),this.raycaster.setFromCamera(this.ndc,this.camera);let r=this.raycaster.ray;if(r.direction.y>=0)return null;let i=-r.origin.y/r.direction.y;return n.copy(r.origin).addScaledVector(r.direction,i)}start(){this.renderer.setAnimationLoop(()=>this.frame())}frame(){let e=Math.min(this.clock.getDelta(),1/20);if(!this.paused){this.elapsed+=e,this.theme.update(e)&&this.applyTheme(),this.syncScroll(),this.ocean.follow(this.focus.z,this.elapsed);for(let t of this.updatables)t(e,this.elapsed);this.fx.render(this.scene,this.camera)}}placeCamera(e){this.focus.set(0,0,e),this.camera.position.set(0,Math.sin(Wa)*this.distance,e+Math.cos(Wa)*this.distance),this.camera.lookAt(this.focus),this.camera.updateMatrixWorld(),this.sun.target.position.copy(this.focus),this.sun.target.position.z+=this.shadowCenterZ,this.sun.position.copy(this.sun.target.position).addScaledVector(this.sunDir,30)}tmp=new H;solveFocusFor(e,t){let n=Math.atan(-t*Math.tan(et.degToRad(Ga/2))),r=Math.sin(Wa)*this.distance;return e-(Math.cos(Wa)*this.distance-r/Math.tan(Wa+n))}},qa={cities:[{name:`Vitalia`,subtitle:`Roatan, Honduras`,dates:`Jan 3rd - Feb 10th`,duration:`39 days`,islandImg:`./images/roatan.png`,size:180,year:2024},{name:`Tokyo`,dates:`Feb 12th - Mar 2nd`,duration:`20 days`,islandImg:`./images/tokyo.png`,islandGif:`./images/tokyo.gif`,size:180,year:2024},{name:`Orange County`,dates:`Mar 3rd - Mar 10th`,duration:`8 days`,islandImg:`./images/orange_county.png`,size:140,year:2024},{name:`New York`,dates:`Mar 10th - Mar 16th`,duration:`7 days`,islandImg:`./images/NY.png`,size:200,year:2024},{name:`Lisbon`,subtitle:`Carvoeiro, Sintra`,dates:`Mar 17th - May 25th`,duration:`70 days`,islandImg:`./images/lisbon.png`,islandGif:`./images/lisbon.gif`,size:150,year:2024},{name:`London`,dates:`May 26th - Jul 6th`,duration:`42 days`,islandImg:`./images/london.png`,size:180,year:2024},{name:`Brussels`,dates:`Jul 6th - Jul 13th`,duration:`8 days`,islandImg:`./images/brussels.png`,size:160,year:2024},{name:`Amsterdam`,dates:`Jul 13th - Jul 20th`,duration:`8 days`,islandImg:`./images/amsterdam.png`,size:160,year:2024},{name:`New York`,dates:`Jul 20th - Aug 6th`,duration:`18 days`,islandImg:`./images/NY.png`,size:200,year:2024},{name:`Las Vegas`,dates:`Aug 6th - Aug 11th`,duration:`6 days`,islandImg:`./images/vegas.png`,size:180,year:2024},{name:`Boulder`,dates:`Aug 11th - Sep 2nd`,duration:`23 days`,islandImg:`./images/boulder.png`,size:180,year:2024},{name:`New York`,dates:`Sep 2nd - Sep 8th`,duration:`7 days`,islandImg:`./images/NY.png`,size:200,year:2024},{name:`Montreal`,dates:`Sep 8th - Sep 22nd`,duration:`15 days`,islandImg:`./images/montreal.png`,size:160,year:2024},{name:`Miami`,dates:`Sep 22nd - Sep 28th`,duration:`7 days`,islandImg:`./images/miami.png`,year:2024},{name:`Iceland`,dates:`Sep 28th - Oct 6th`,duration:`9 days`,islandImg:`./images/iceland.png`,size:180,year:2024},{name:`Lisbon`,dates:`Oct 6th - Oct 19th`,duration:`14 days`,islandImg:`./images/lisbon.png`,islandGif:`./images/lisbon.gif`,size:150,year:2024},{name:`New York`,dates:`Oct 19th - Oct 26th`,duration:`8 days`,islandImg:`./images/NY.png`,size:200,year:2024},{name:`Seoul`,dates:`Oct 26th - Nov 2nd`,duration:`8 days`,islandImg:`./images/seoul.png`,size:160,year:2024},{name:`Chiang Mai`,dates:`Nov 2nd - Nov 10th`,duration:`9 days`,islandImg:`./images/chiang_mai.png`,size:160,year:2024},{name:`Bangkok`,dates:`Nov 10th - Nov 17th`,duration:`8 days`,islandImg:`./images/bangkok.png`,size:160,year:2024},{name:`Hong Kong`,dates:`Nov 17th - Nov 24th`,duration:`8 days`,islandImg:`./images/hong_kong.png`,size:180,year:2024},{name:`Tokyo`,subtitle:`Minakami, Nikko`,dates:`Nov 24th - Dec 14th`,duration:`21 days`,islandImg:`./images/tokyo.png`,islandGif:`./images/tokyo.gif`,size:180,year:2024},{name:`Orange County`,subtitle:`Yorba Linda`,dates:`Dec 14th - Dec 24th`,duration:`11 days`,islandImg:`./images/orange_county.png`,size:140,year:2024},{name:`Boulder`,dates:`Dec 24th - Dec 28th`,duration:`5 days`,islandImg:`./images/denver.png`,size:180,year:2024},{name:`Miami`,subtitle:`Key Largo, New Orleans`,dates:`Jan 1st - Apr 6th`,duration:`96 days`,islandImg:`./images/miami.png`,blog:`./posts/miami.md`,blogTitle:`Tied down`,year:2025},{name:`New York`,dates:`Apr 6 - Apr 25th`,duration:`21 days`,islandImg:`./images/NY.png`,size:200,year:2025},{name:`Madrid`,dates:`Apr 26 - May 2nd`,duration:`7 days`,islandImg:`./images/madrid.png`,size:150,year:2025},{name:`Granada`,dates:`May 2nd - May 11th`,duration:`10 days`,islandImg:`./images/granada.png`,size:180,year:2025},{name:`Hyeres`,subtitle:`Marseille, Toulon, St Tropez`,dates:`May 12th - Jun 7th`,duration:`26 days`,islandImg:`./images/hyeres.png`,islandGif:`./images/hyeres.gif`,blog:`./posts/hyeres.md`,blogTitle:`Bread is the answer`,size:160,year:2025},{name:`Antibes`,subtitle:`Nice, Monaco`,dates:`Jun 7th - Jun 28th`,duration:`22 days`,islandImg:`./images/antibes.png`,blog:`./posts/antibes.md`,blogTitle:`When you can't beat em`,size:160,year:2025},{name:`Cannes`,dates:`Jun 28th - Jul 6th`,duration:`8 days`,islandImg:`./images/cannes.png`,islandGif:`./images/cannes.gif`,size:160,year:2025},{name:`Scotland`,subtitle:`Aviemore, Isle of Skye, Glencoe`,dates:`Jul 6th - Aug 17th`,duration:`43 days`,islandImg:`./images/scotland.png`,size:150,year:2025},{name:`Dakhla`,subtitle:`Casablanca, Morocco`,dates:`Aug 17th - Sep 13th`,duration:`26 days`,islandImg:`./images/dakhla.png`,blog:`./posts/dakhla.md`,blogTitle:`The French have watches`,size:160,year:2025},{name:`Lisbon`,dates:`Sep 13th - Sep 21st`,duration:`9 days`,islandImg:`./images/lisbon.png`,islandGif:`./images/lisbon.gif`,size:150,year:2025},{name:`New York`,dates:`Sep 21st - Oct 11th`,duration:`20 days`,islandImg:`./images/NY.png`,size:200,year:2025},{name:`Santiago`,dates:`Oct 11th - Oct 18th`,duration:`8 days`,islandImg:`./images/santiago.png`,size:160,year:2025},{name:`Patagonia`,dates:`Oct 18th - Nov 15th`,duration:`28 days`,islandImg:`./images/patagonia.png`,islandGif:`./images/patagonia.gif`,size:180,year:2025},{name:`Buenos Aires`,subtitle:`Colonia del Sacramento, Iguazu Falls`,dates:`Nov 15th - Nov 29th`,duration:`14 days`,islandImg:`./images/buenos_aires.png`,size:160,year:2025},{name:`Joshua Tree`,dates:`Nov 29th - Dec 8th`,duration:`10 days`,islandImg:`./images/joshua_tree.png`,size:140,year:2025},{name:`New York`,dates:`Dec 8th - Dec 12th`,duration:`5 days`,islandImg:`./images/NY.png`,size:200,year:2025},{name:`Orange County`,dates:`Dec 12th - Dec 27th`,duration:`15 days`,islandImg:`./images/orange_county.png`,size:140,year:2025},{name:`La Ventana`,subtitle:`La Paz, Puerto San Carlos`,dates:`Dec 27th - Jan 5th`,duration:`10 days`,islandImg:`./images/la_ventana.png`,size:140,year:2025},{name:`New York`,dates:`Jan 5th - Jan 13th`,duration:`9 days`,islandImg:`./images/NY.png`,size:200,year:2026},{name:`Miami`,dates:`Jan 13th - Feb 13th`,duration:`32 days`,islandImg:`./images/miami.png`,year:2026},{name:`Denver`,subtitle:`Boulder, Tabernash`,dates:`Feb 15th - Mar 30th`,duration:`45 days`,islandImg:`./images/denver.png`,size:180,year:2026},{name:`New York`,dates:`Mar 30th - May 16th`,duration:`48 days`,islandImg:`./images/NY.png`,blog:`./posts/new_york.md`,blogTitle:`The City`,size:200,year:2026},{name:`Montana`,dates:`May 16th - Jun 21st`,duration:`37 days`,islandImg:`./images/montana.png`,islandGif:`./images/montana.gif`,size:200,year:2026},{name:`New York`,dates:`Jun 21st - Jun 30th`,duration:`10 days`,islandImg:`./images/NY.png`,size:200,year:2026},{name:`Boulder`,dates:`Jun 30th - Aug 16th`,duration:`48 days`,islandImg:`./images/boulder.png`,size:180,year:2026},{name:`Munich`,dates:`Aug 17th - Aug 22nd`,duration:`6 days`,islandImg:`./images/munich.png`,size:160,year:2026},{name:`Innsbruck`,subtitle:`Rotholz, Oktoberfest`,dates:`Aug 24th - Sep 26th`,duration:`34 days`,islandImg:`./images/innsbruck.png`,size:180,year:2026},{name:`Salzkammergut`,subtitle:`Bad Goisern, Gosau`,dates:`Sep 27th - Oct 4th`,duration:`8 days`,islandImg:`./images/salzkammergut.png`,size:160,year:2026},{name:`New York`,dates:`Oct 4th - Oct 17th`,duration:`14 days`,islandImg:`./images/NY.png`,size:200,year:2026},{name:`Zermatt`,subtitle:`Switzerland`,dates:`Oct 17th - Oct 31st`,duration:`15 days`,islandImg:`./images/switzerland.png`,size:180,year:2026},{name:`Mumbai`,subtitle:`Devcon 8`,dates:`Nov 1st - Nov 7th`,duration:`7 days`,islandImg:`./images/mumbai.png`,size:160,year:2026}],quotes:[`The things you own end up owning you.`,`Travel is not a reward for working, it's education for living.`,`If a problem can be solved by money or time, it's not a problem.`,`It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to.`]},Ja=[{name:`Austria`,key:`austria`,members:[`Innsbruck`,`Salzkammergut`]}];function Ya(e){let t=[];for(let n of e){let r=Ja.find(e=>e.members.includes(n.name));if(!r){t.push(n);continue}if(n.name!==r.members[0])continue;let i=r.members.map(t=>e.find(e=>e.name===t)).filter(e=>!!e),a=i[0],o=i[i.length-1],s=i.reduce((e,t)=>e+(parseInt(t.duration,10)||0),0);t.push({...a,name:r.name,key:r.key,subtitle:void 0,dates:`${a.dates.split(` - `)[0]} - ${o.dates.split(` - `).pop()}`,duration:`${s} days`,size:Math.max(...i.map(e=>e.size??0))||a.size,blog:i.find(e=>e.blog)?.blog,blogTitle:i.find(e=>e.blog)?.blogTitle,stops:i.map(e=>({name:e.name,subtitle:e.subtitle,dates:e.dates,duration:e.duration}))})}return t}var Xa=Ya(qa.cities),Za=qa.quotes;function Qa(e){return e.key?e.key:(e.islandImg.split(`/`).pop()??e.islandImg).replace(/\.[a-z0-9]+$/i,``)}function $a(){return Xa.filter(e=>e.blog)}var eo={Jan:0,January:0,Feb:1,February:1,Mar:2,March:2,Apr:3,April:3,May:4,Jun:5,June:5,Jul:6,July:6,Aug:7,August:7,Sep:8,Sept:8,September:8,Oct:9,October:9,Nov:10,November:10,Dec:11,December:11};function to(e,t){let[n,r]=e.replace(/(\d+)(st|nd|rd|th)/,`$1`).trim().split(` `),i=eo[n],a=parseInt(r,10);return i!==void 0&&!isNaN(a)?new Date(t,i,a):null}function no(e,t){if(!e.includes(` - `))return null;let n=t??new Date().getFullYear(),[r,i]=e.split(` - `),a=to(r,n),o=to(i,n);return a&&o&&o<a&&(o=to(i,n+1)),a&&o?{start:a,end:o}:null}function ro(e){let t=no(e.dates,e.year);if(!t)return!1;let n=new Date((t.start.getTime()+t.end.getTime())/2).getMonth();return n>=10||n<=2}function io(e=new Date){return Xa.findIndex(t=>{let n=no(t.dates,t.year);return!!n&&e>=n.start&&e<=n.end})}var ao=120;function oo(e){let t=e>900?4:e>600?2:1,n=t===1?0:t===2?4.6:4.4,r=t===1?6.2:5.8,i=[],a=[],o=Xa.map((e,t)=>({city:e,index:t})).reverse(),s=0,c=null,l=0;for(let{city:e,index:u}of o){let o=!1;e.year&&e.year!==c&&(o=c!==null,c!==null&&(s=(l%t===0?s-r:s)+2.3),a.push({year:e.year,z:s}),s+=5.2,c=e.year,l=0);let d=Math.floor(l/t),f=l%t;d%2==1&&(f=t-1-f);let p=t===1?(l%2==0?-1:1)*.9:(f-(t-1)/2)*n,m=(e.size??ao)/ao*2.1;i.push({city:e,index:u,x:p,z:s,width:m,radius:m*.47,crossesYear:o}),l++,l%t===0&&(s+=r)}let u=i[i.length-1];return{islands:i,years:a,titleZ:-2.6,endZ:u?u.z:0,halfWidth:t===1?2.6:(t-1)/2*n+2.5,columns:t}}var so=new Xe,co=new o,lo=new Map;function uo(e){let t=se(e),n=lo.get(t);return n||(n=so.loadAsync(t).then(e=>(e.colorSpace=E,e.anisotropy=4,e)),lo.set(t,n)),n}async function fo(){try{let e=await fetch(`${c}manifest.json`,{cache:`no-cache`});return e.ok?await e.json():{}}catch{return{}}}var po=new Map;function mo(e){let t=po.get(e);return t||(t=co.loadAsync(c+e),po.set(e,t)),t}function G(e,t,n,r=1,i=[0,0,0]){let a=typeof r==`number`?new H(r,r,r):new H(...r),o=new Oe().setFromEuler(new Mt(i[0],i[1],i[2],`YXZ`));return new ie().compose(new H(e,t,n),o,a)}var K=(e,t,n)=>new H(e,t,n);function ho(e,t,n=1){let r=t.clone().sub(e),i=r.length(),a=new Oe().setFromUnitVectors(new H(0,1,0),r.normalize()),o=e.clone().add(t).multiplyScalar(.5);return new ie().compose(o,a,new H(n,i,n))}var go={plain:0,ground:1,earth:2,rock:3},_o=new Set([`position`,`normal`,`aWater`]);function vo(e,t,n=!1){let r=e.clone();r.clearGroups();for(let e of Object.keys(r.attributes))n&&e===`color`||(!_o.has(e)||e===`aWater`&&t!==`water`)&&r.deleteAttribute(e);if(r.attributes.normal||r.computeVertexNormals(),!r.index){let e=r.attributes.position.count,t=new Uint32Array(e);for(let n=0;n<e;n++)t[n]=n;r.setIndex(new xe(t,1))}if(t===`water`&&!r.attributes.aWater){let e=r.attributes.position.count,t=new Float32Array(e*3);for(let n=0;n<e;n++)t[n*3+2]=.7;r.setAttribute(`aWater`,new xe(t,3))}return r}function yo(e){let t=2166136261;for(let n=0;n<e.length;n++)t=Math.imul(t^e.charCodeAt(n),16777619);return t=t>>>0||1,()=>(t^=t<<13,t^=t>>>17,t^=t<<5,(t>>>0)/4294967296)}var bo=class e{rand;shore=null;ground=`#6cbf3c`;topY=.36;detail=!0;stack=[new ie];buckets={solid:[],glass:[],water:[]};parts=[];tmp=new ie;color=new N;tex=go.plain;footprints=[];capture=null;constructor(e=`island`){this.rand=yo(e)}range(e,t){return e+this.rand()*(t-e)}group(e,t){this.stack.push(this.top.clone().multiply(e));try{t()}finally{this.stack.pop()}}get top(){return this.stack[this.stack.length-1]}textured(e,t){let n=this.tex;this.tex=e;try{t()}finally{this.tex=n}}geometries(e){return this.buckets[e]}footprint(e,t){if(this.capture)return t();this.capture={kind:e,geos:[],parts:[]};try{return t()}finally{let e=this.capture;this.capture=null,this.commitFootprint(e)}}add(e,t,n,r=`solid`){let i=vo(e,r);i.applyMatrix4(n?this.tmp.multiplyMatrices(this.top,n):this.top),this.color.set(t);let a=i.attributes.position.count,o=new Float32Array(a*3);for(let e=0;e<a;e++)o[e*3]=this.color.r,o[e*3+1]=this.color.g,o[e*3+2]=this.color.b;i.setAttribute(`color`,new xe(o,3)),i.setAttribute(`aTex`,new xe(new Float32Array(a).fill(this.tex),1)),this.buckets[r].push(i),this.capture?.geos.push(i)}bake(e,t,n=`solid`){let r=vo(e,n,!0);r.applyMatrix4(t?this.tmp.multiplyMatrices(this.top,t):this.top),r.setAttribute(`aTex`,new xe(new Float32Array(r.attributes.position.count).fill(this.tex),1)),this.buckets[n].push(r),this.capture?.geos.push(r)}part(e,t,n){let r={factory:e,matrix:t?this.top.clone().multiply(t):this.top.clone(),halfX:n?.halfX??0,halfZ:n?.halfZ??0};this.parts.push(r),this.capture?.parts.push(r)}template(){let e=[];for(let t of[`solid`,`glass`,`water`]){let n=this.buckets[t];if(!n.length)continue;let r=Ft(n);for(let e of n)e.dispose();r&&e.push({bucket:t,geometry:r})}return{meshes:e,parts:this.parts}}static model(t,n=`model`){let r=new e(n);t(r);let i=new Le;for(let{bucket:e,geometry:t}of r.template().meshes)i.add(new M(t,Oa[e]));return i}commitFootprint(e){let t=1/0,n=-1/0,r=1/0,i=-1/0,a=(e,a,o,s)=>{e<t&&(t=e),a>n&&(n=a),o<r&&(r=o),s>i&&(i=s)};for(let t of e.geos){let e=t.attributes.position;for(let t=0;t<e.count;t++)a(e.getX(t),e.getX(t),e.getZ(t),e.getZ(t))}for(let t of e.parts){let e=t.matrix.elements;for(let n of[-1,1])for(let r of[-1,1]){let i=e[12]+e[0]*t.halfX*n+e[8]*t.halfZ*r,o=e[14]+e[2]*t.halfX*n+e[10]*t.halfZ*r;a(i,i,o,o)}}let o=Math.max(n-t,i-r);!Number.isFinite(o)||o<.012||o>1.4||this.footprints.push({kind:e.kind,minX:t,maxX:n,minZ:r,maxZ:i,geos:e.geos,parts:e.parts})}};function xo(e){e.traverse(e=>{let t=e;t.isMesh&&(t.castShadow=!t.material.transparent&&t.material!==Oa.water,t.receiveShadow=!0)})}function So(e){let t=new Le;for(let{bucket:n,geometry:r}of e.meshes)t.add(new M(r,Oa[n]));let n=[];for(let{factory:r,matrix:i}of e.parts){let e=r(),a=new Le;a.applyMatrix4(i),a.add(e.object),t.add(a),e.update&&n.push(e.update)}return xo(t),{object:t,update(e,t){for(let r of n)r(e,t)}}}var q={grass:`#8fd14f`,grassDark:`#6cbf3c`,foliage:`#5cb83a`,foliageDark:`#3f9a34`,pine:`#2f8f46`,palmLeaf:`#3fae3f`,trunk:`#9a5a2c`,trunkDark:`#7a4320`,dirt:`#e0913f`,dirtDark:`#c46a2a`,sand:`#f2c65a`,sandLight:`#f8dc8c`,sandDark:`#e0a940`,cobble:`#e9c88e`,cobbleDark:`#d9b072`,snow:`#f4f8fb`,ice:`#c6ecf7`,rock:`#b3aca2`,rockDark:`#8f877d`,redRock:`#d9783a`,redRockDark:`#b5552a`,mountain:`#c97b4a`,mountainGrey:`#a7a3a6`,water:`#3cc3d9`,waterDeep:`#2a8fc4`,pool:`#55dbe6`,lake:`#3aa9db`,river:`#4fb3e8`,foam:`#f2fbff`,white:`#f7f3ea`,cream:`#f4e7c6`,stucco:`#f2c87a`,ochre:`#f0b44c`,ochreDark:`#c98a2e`,terracotta:`#e8642c`,roofRed:`#d9472b`,roofOrange:`#ee7a32`,teal:`#3cc9b7`,tealDark:`#2aa596`,blueRoof:`#3b7fd9`,wood:`#b07440`,woodDark:`#80502a`,log:`#b8743c`,metal:`#5c6168`,black:`#2a2a2e`,windowBlue:`#2f5f8a`,windowTeal:`#2f8f9a`,glassBlue:`#3f86c9`,red:`#d62828`,pink:`#ff4fa3`,yellow:`#ffd23f`},Co=new pe({color:`#f4f1ea`,roughness:1,transparent:!0,opacity:.9}),wo=new pe({color:`#ffffff`,roughness:1,transparent:!0,opacity:.75}),To=new pe({color:`#ffb13b`,emissive:`#ff7a1a`,emissiveIntensity:1.4});function Eo(e,t=!0){let n=document.createElement(`canvas`);n.width=96,n.height=64;let r=n.getContext(`2d`);e.forEach((i,a)=>{r.fillStyle=i,t?r.fillRect(n.width/e.length*a,0,n.width/e.length+1,n.height):r.fillRect(0,n.height/e.length*a,n.width,n.height/e.length+1)});let i=new Ce(n);return i.colorSpace=E,i}function Do(e,t,n,r,i={}){let a=i.poleHeight??.35,o=i.width??.16,s=i.height??.11;e.add(B(1,1,6),i.pole??q.wood,G(t,n+a/2,r,[.008,a,.008])),e.add(F(`low`),i.pole??q.ochre,G(t,n+a+.008,r,.014));let c=new pe({map:i.texture??Eo(i.stripes??[`#e2552d`],!i.horizontal),side:2,roughness:.9});e.part(()=>{let e=new bt(o,s,10,4).translate(o/2,-s/2,0),t=new M(e,c),n=e.attributes.position,r=Float32Array.from(n.array),i=Math.random()*6;return{object:t,update(t){for(let e=0;e<n.count;e++){let a=r[e*3]/o;n.setZ(e,Math.sin(a*5-t*4+i)*.018*a),n.setY(e,r[e*3+1]-a*a*.01)}n.needsUpdate=!0,e.computeVertexNormals()}}},G(t+.006,n+a,r))}function Oo(e,t,n={}){let r=n.count??6,i=n.height??.35,a=n.size??.035,o=n.period??3.5,s=n.spread??.06;e.part(()=>{let e=new Le,t=Array.from({length:r},()=>e.add(new M(F(`low`),n.steam?wo:Co)).children.at(-1)),c=Math.random()*10;return{object:e,update(e){t.forEach((t,n)=>{let l=(e/o+n/r+c)%1;t.position.set(Math.sin(l*4+n)*s*l+l*s,l*i,Math.cos(l*3+n)*s*.5*l),t.scale.setScalar(a*(.6+l*1.6)*(1-l**4))})}}},G(t.x,t.y,t.z))}function ko(e,t,n,r,i=.9){e.add(B(.55,1,12),q.cobbleDark,G(t,n+.02,r,[.16,.04,.14])),e.add(B(.6,1,10),q.cobble,G(t,n+.06,r,[.08,.06,.07])),e.part(()=>{let e=new Le,t=new M(B(.6,1,10),wo);e.add(t);let n=[];for(let t=0;t<14;t++){let t=new M(F(),Co);e.add(t),n.push(t)}let r=Math.random()*10;return{object:e,update(e){let a=(e+r)%10/10,o=Math.max(0,Math.min(1,a*8)*Math.min(1,(.55-a)*6)),s=.18+o*i;t.scale.set(.03+o*.02,s*.85,.03+o*.02),t.position.y=s*.85/2,n.forEach((t,r)=>{let i=(e*(.35+o*.5)+r/n.length)%1,a=.03+i*(.04+o*.07);t.position.set(Math.sin(r*2.3+e)*.03*i,s*(.55+i*.5),Math.cos(r*1.7)*.03*i),t.scale.setScalar(a*(1-i**3))})}}},G(t,n+.08,r))}var Ao=new pe({color:`#d9f6ff`,roughness:.3,transparent:!0,opacity:.85});function jo(e,t,n,r,i=.12,a=q.cream){e.add(B(1,1,18),a,G(t,n+.02,r,[i,.04,i])),e.add(B(1,1,18),q.pool,G(t,n+.041,r,[i*.84,.002,i*.84]),`water`),e.add(B(.7,1,10),a,G(t,n+.07,r,[i*.18,.06,i*.18])),e.add(B(1,.4,12),a,G(t,n+.11,r,[i*.42,.02,i*.42])),e.part(()=>{let e=new Le,t=Array.from({length:16},()=>e.add(new M(F(`low`),Ao)).children.at(-1));return{object:e,update(e){t.forEach((t,n)=>{let r=(e*.9+n/16)%1,a=n*2.39996,o=r*i*.62;t.position.set(Math.cos(a)*o,4*r*(1-r)*i*.9,Math.sin(a)*o),t.scale.setScalar(i*.07*(1-r*.4))})}}},G(t,n+.12,r))}function Mo(e,t,n,r,i=.15){e.part(()=>{let e=new Le,t=Array.from({length:6},(t,n)=>{let r=new M(F(`low`),wo);return r.position.x=(n/5-.5)*i,e.add(r),r});return{object:e,update(e){t.forEach((t,n)=>{let r=.022+Math.sin(e*5+n*1.9)*.008;t.scale.set(r*1.3,r*.8,r),t.position.y=Math.abs(Math.sin(e*3+n))*.01})}}},G(t,n,r))}function No(e,t,n,r){e.part(()=>{let e=new Le,t=Array.from({length:4},(t,n)=>{let r=new M(xt(6),To);return r.position.set(Math.cos(n*1.6)*.012,0,Math.sin(n*1.6)*.012),e.add(r),r});return{object:e,update(e){t.forEach((t,n)=>{let r=.8+Math.sin(e*13+n*2.1)*.2+Math.sin(e*7.3+n)*.1;t.scale.set(.02,.07*r,.02)})}}},G(t,n,r))}function Po(e,t,n,r={}){let i=new T(n),a=i.getLength(),o=r.speed??.12,s=r.dwell??1.5;e.part(()=>{let e=t.clone(),n=new H,c=Math.random()*10;return{object:e,update(t,l){let u,d=!0;if(r.pingPong){let e=a/o,n=e+s,r=(t+c)%(n*2);r<n?u=Math.min(1,r/e):(u=1-Math.min(1,(r-n)/e),d=!1)}else u=(t+c)*o/a%1;i.getPointAt(u,e.position),i.getTangentAt(u,n),d||n.negate();let f=-Math.atan2(n.z,n.x),p=Math.atan2(n.y,Math.hypot(n.x,n.z)),m=1-Math.exp(-(l??1/30)*5);e.rotation.order=`YZX`,e.rotation.y=f,e.rotation.z+=(p-e.rotation.z)*m,e.rotation.x=0}}})}function Fo(e,t,n,r,i,a={}){let o=new H;e.part(()=>{let e=t.clone(),n=Math.random()*6;return e.rotation.y=a.ry??0,{object:e,update(t){e.position.y=Math.sin(t*1.3+n)*(a.amp??.01),e.rotation.z=Math.sin(t*1.1+n)*(a.roll??.05),e.rotation.x=Math.sin(t*.9+n*2)*(a.roll??.05)*.6,a.spin&&(e.rotation.y=(a.ry??0)+t*a.spin);let r=e.parent;if(a.sea&&r){r.getWorldPosition(o);let{x:n,z:i}=o,a=b(n,i,t),s=.25;e.position.y+=r.worldToLocal(o.set(n,a,i)).y,e.rotation.z+=Math.atan((b(n+s,i,t)-a)/s),e.rotation.x-=Math.atan((b(n,i+s,t)-a)/s)}}}},G(n,r,i,a.s??1))}function Io(e,t,n,r,i,a,o,s={}){let c=s.ry??0,l=s.s??1,u=s.dip??.6;e.group(G(i,a,o,l,[0,c,0]),()=>t(e));let d=bo.model(n);e.part(()=>{let e=d.clone(),t=Math.random()*20;return{object:e,update(n){let r=(n+t)%7/7,i=Math.max(0,Math.min(1,(r-.55)*8)*Math.min(1,(.95-r)*8));e.rotation.z=-i*u}}},G(i,a,o,l,[0,c,0]).multiply(G(r.x,r.y,r.z)))}function Lo(e,t,n,r=.35){let i=bo.model(e=>{e.add(B(1,1,8),q.white,G(0,.004,0,[.06,.008,.02],[0,0,0])),e.add(B(.8,1,6),q.black,G(0,.04,0,[.012,.06,.012],[0,0,.25])),e.add(F(`low`),`#f1c29a`,G(-.012,.08,0,.012))}),a=bo.model(e=>{for(let t=0;t<5;t++){let n=-.9+t/4*1.8;e.add(F(`low`),t%2?q.pink:q.yellow,G(0,Math.cos(n)*.12,Math.sin(n)*.12,[.03,.012,.03],[n,0,0]))}});e.part(()=>{let e=new Le,t=i.clone(),n=a.clone();e.add(t,n);let o=new pe({color:`#333`}),s=new M(B(1,1,3),o);e.add(s);let c=Math.random()*6,l=new H,u=new H;return{object:e,update(e){let i=e*.35+c;t.position.set(Math.cos(i)*r,.05,Math.sin(i)*r*.45),t.rotation.y=-i-Math.PI/2,n.position.set(t.position.x-Math.cos(i+1.2)*.12,.38+Math.sin(e*1.7)*.03,t.position.z-Math.sin(i+1.2)*.06),n.rotation.y=t.rotation.y,l.copy(t.position).setY(.06),u.copy(n.position),s.position.copy(l).add(u).multiplyScalar(.5),s.scale.set(.002,l.distanceTo(u),.002),s.quaternion.setFromUnitVectors(new H(0,1,0),u.sub(l).normalize())}}},G(t,0,n))}function Ro(e,t,n,r,i,a=.15){e.part(()=>{let e=t.clone(),n=Math.random()*6;return{object:e,update(t){e.rotation.y=t*a+n,e.position.y=Math.sin(t*.8+n)*.02}}},G(n,r,i))}var J=.36;function zo(e,t,n=0,r=0){return e.map(e=>new P(e.x*t+n,e.y*t+r))}function Y(e,t={}){let n=t.topY??.36,r=t.outline??Dt(e.rand,t.radius??.95,t.wobble??.05,56,t.stretch??[1,1]);return e.shore=zo(r,1.015),e.ground=t.top??q.grass,e.topY=n,e.textured(t.paved?go.plain:go.earth,()=>{e.add(Vt(zo(r,.97),-.5,n-.2,.03,.14),t.sideDark??q.dirtDark),e.add(Vt(r,n-.24,n-.06,.035),t.side??q.dirt)}),e.textured(t.paved?go.plain:go.ground,()=>e.add(Vt(zo(r,1.015),n-.1,n,.045),t.top??q.grass)),r}function Bo(e,t,n,r,i=q.grass,a=q.dirt){e.textured(go.earth,()=>e.add(Vt(zo(t,.985),n,r-.05,.03),a)),e.textured(go.ground,()=>e.add(Vt(t,r-.08,r,.04),i))}function Vo(e,t,n,r,i,a,o=q.grassDark,s=.33999999999999997){e.textured(go.ground,()=>e.add(F(),o,G(t,s,n,[r,i,a])))}function Ho(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let o=e[i].y,s=e[a].y,c=e[i].x,l=e[a].x;o>n!=s>n&&t<(l-c)*(n-o)/(s-o)+c&&(r=!r)}return r}function Uo(e,t,n,r=J,i){let a=(e,n)=>{if(i&&!Ho(i,e,n))return r;let a=0;for(let r of t){let t=(e-r.x)/r.sx,i=(n-r.z)/r.sz,o=t*t+i*i;o<1&&(a+=r.h*.5*(1+Math.cos(Math.PI*Math.sqrt(o))))}return r+a},o=1/0,s=-1/0,c=1/0,l=-1/0;for(let e of t)o=Math.min(o,e.x-e.sx),s=Math.max(s,e.x+e.sx),c=Math.min(c,e.z-e.sz),l=Math.max(l,e.z+e.sz);let u=[],d=[];for(let e=0;e<=28;e++){let t=c+e/28*(l-c);for(let e=0;e<=28;e++){let n=o+e/28*(s-o);u.push(n,a(n,t),t)}}let f=(e,t)=>u[(t*29+e)*3+1],p=r+.008;for(let e=0;e<28;e++)for(let t=0;t<28;t++){if(f(t,e)<=p&&f(t+1,e)<=p&&f(t+1,e+1)<=p&&f(t,e+1)<=p)continue;let n=e*29+t,r=n+1,i=n+28+1,a=i+1;d.push(n,i,r,r,i,a)}let m=new v;return m.setAttribute(`position`,new ct(u,3)),m.setIndex(d),m.computeVertexNormals(),e.textured(go.ground,()=>e.add(m,n)),a}function Wo(e,t,n,r){let i=e.range(0,6.28),a=e.range(.22,.36),o=e=>Math.max(0,1-e*e)**.7,s=e=>.15+a*Math.sin(e*2.6+i),c=e=>r.height*o(e)*(.75+.25*Math.sin(e*4.2+i)),l=e=>r.width/2*(.5+.5*o(e)),u=e=>{let t=[];for(let n=0;n<=20;n++){let i=n/20*2-1,a=s(i),o=c(i);for(let n=0;n<=6;n++){let s=n/6,c=e?a+(1-a)*s:-1+(a+1)*s,u=e?o*(1-s)**1.15:o*(1-(1-s)**1.25);t.push(i*r.length/2,u,c*l(i))}}let n=[];for(let e=0;e<20;e++)for(let t=0;t<6;t++){let r=e*7+t,i=r+6+1;n.push(r,r+1,i,i,r+1,i+1)}let i=new v;return i.setAttribute(`position`,new ct(t,3)),i.setIndex(n),i.computeVertexNormals(),i},d=G(t,r.y??.33999999999999997,n,1,[0,(r.ry??0)+Math.PI,0]);e.textured(go.ground,()=>{e.add(u(!1),r.paint??q.sand,d),e.add(u(!0),r.shade??q.sandDark,d)})}function Go(e,t,n,r,i,a=q.mountain,o,s=.32){let c=e.rand()*6.28,l=it(e.rand);e.textured(go.rock,()=>e.add(l(),a,G(t,s,n,[r,i,r*.9],[0,c,0]))),o&&e.textured(go.ground,()=>e.add(l(.6,1.06),o,G(t,s+i*.6,n,[r,i*.4+.006,r*.9],[0,c,0])))}function Ko(e,t,n,r,i,a=q.redRock,o=q.redRockDark,s=.32){for(let c=0;c<5;c++){let l=c===0,u=c/4*6.28+e.range(-.3,.3),d=l?0:r*e.range(.45,.65),f=t+Math.cos(u)*d,p=n+Math.sin(u)*d*.8,m=i*(l?1:e.range(.45,.7)),h=l?5:3;for(let t=0;t<h;t++){let n=t/h,i=r*(l?.55:.42)*(1-n*.55),u=G(f+e.range(-.02,.02),s+m*(n*.85+.1),p,[i,m/h*.85,i*.9],[0,e.rand()*6,e.range(-.15,.15)]);e.textured(go.rock,()=>e.add(F(),(t+c)%2?a:o,u))}}}function qo(e,t,n,r,i,a=q.mountainGrey,o=q.snow,s=.32){let c=.45;e.textured(go.rock,()=>{e.add(V(),a,G(t,s,n,[r,i,r*.78],[0,c,0])),e.add(V(),a,G(t-r*.42,s,n+r*.1,[r*.48,i*.5,r*.4],[0,.95,0])),e.add(V(),a,G(t+r*.36,s,n-r*.08,[r*.4,i*.44,r*.34],[0,.04999999999999999,0]))});let l=.45,u=l*1.06;e.textured(go.ground,()=>e.add(V(),o,G(t,s+i*.55,n,[r*u,i*l+.008,r*.78*u],[0,c,0])))}function Jo(e,t,n,r,i,a,o,s){for(let c=0;c<r;c++){let l=r===1?.5:c/(r-1),u=t.clone().lerp(n,l),d=1-Math.abs(l-.5)*.7;Go(e,u.x+e.range(-.04,.04),u.z+e.range(-.04,.04),i*e.range(.85,1.1),a*d*e.range(.85,1.1),o,s,u.y)}}function Yo(e,t,n=J,r=q.water,i){i&&e.add(Vt(zo(t,1+i.width),n-.02,n+.006,.006),i.paint),e.add(me(t,n+.008),r,void 0,`water`)}function Xo(e,t,n){return new N(e).lerp(new N(t),n).getStyle()}var Zo=.045;function Qo(e,t,n,r){let i=n.clone().setY(0);if(i.lengthSq()<1e-8)return null;i.normalize();let a=is(e,t.x,t.z);if(a>r)return null;let o=t.clone();if(a>0)for(let n=0;n<r+.3;n+=.004){let r=t.clone().addScaledVector(i,n);if(is(e,r.x,r.z)<=0){o=r;break}}else for(let n=0;n<.6;n+=.004){let r=t.clone().addScaledVector(i,-n);if(is(e,r.x,r.z)>=0){o=r;break}}let s=i.clone();return{at:o,out:s}}function $o(e,t,n,r,i,a=.049){let{at:o,out:s}=e,c=[];for(let e of[.05,.02])c.push(o.clone().addScaledVector(s,-e).setY(t));for(let e of[0,.25,.5,.75,1]){let t=e*Math.PI/2,r=Math.sin(t)*Zo,a=n-Zo+Math.cos(t)*Zo;c.push(o.clone().addScaledVector(s,r+Math.sin(t)*i).setY(Math.max(a+Math.cos(t)*i,a)))}if(r<n-Zo-.005)for(let e of[.35,1])c.push(o.clone().addScaledVector(s,a).setY(n-Zo+(r-(n-Zo))*e));return c}function es(e,t,n,r){if(!e)return t;let i=0,a=t.length,o=t=>is(e,t.x,t.z)<=.06;if(n)for(;i<a-2&&o(t[i]);)i++;if(r)for(;a>i+2&&o(t[a-1]);)a--;return t.slice(i,a)}function ts(e,t,n,r=q.river,i=1,a,o=!0){let s=o&&e.shore?os(e.shore,t,n,!0,.16,o===`tail`):t,c=o?e.shore:null,l=s.length,u=s[0].y,d=e.topY,f=(e,t)=>{let r=c?Qo(c,e,e.clone().sub(t),n/2+.08):null;return r?{c:r,fall:$o(r,u,d,0,.004,.056999999999999995)}:null},p=l>1&&o!==`tail`?f(s[0],s[1]):null,m=l>1?f(s[l-1],s[l-2]):null,h=es(c,s,!!p,!!m),g=[...p?p.fall.slice().reverse():[],...h,...m?m.fall:[]],_=a===null?null:a??Xo(Xo(e.ground,`#8a7350`,.45),`#000000`,.06);if(_){let t=e=>e.slice(0,3),r=h;if(o===`tail`){let e=0,t=1;for(;t<h.length-2&&e<.12;t++)e+=h[t].distanceTo(h[t-1]);r=h.slice(t-1)}let i=[...p?t(p.fall).reverse():[],...r,...m?t(m.fall):[]];e.add(Ge(i.map(e=>e.clone().setY(e.y-.003)),n+.08,{samples:i.length*2,tight:!0}),_),e.add(Ge(i.map(e=>e.clone().setY(e.y-.0015)),n+.03,{samples:i.length*2,tight:!0}),Xo(_,`#3a3428`,.35))}e.add(Ge(g,n,{speed:i,samples:g.length*2,tight:!0,fromMiddle:!!p&&!!m}),r,void 0,`water`);for(let t of[p,m]){if(!t)continue;let{at:r,out:i}=t.c,a=r.clone().addScaledVector(i,.075);e.group(G(a.x,.02,a.z,1,[0,Math.atan2(-i.x,-i.z),0]),()=>Mo(e,0,0,0,n*.9))}}function ns(e,t,n,r){let i=n.clone().setY(0).normalize(),a=t.clone();for(let n=0;n<1&&(a=t.clone().addScaledVector(i,n),!(is(e,a.x,a.z)<-r));n+=.005);return a}function rs(e,t,n,r,i={}){let a=i.reach??.3,o=i.fit??!0?e.shore:null,s=o?os(o,t,n,!1,a):t,c=s.length,l=e=>!!o&&is(o,e.x,e.z)<n/2+.06,u=c>1&&l(s[0]),d=c>1&&l(s[c-1]),f=s;o&&u&&(f=[ns(o,f[0],f[0].clone().sub(f[1]),.08),...f]),o&&d&&(f=[...f,ns(o,f[f.length-1],f[f.length-1].clone().sub(f[f.length-2]),.08)]);let p=o?(e,t)=>is(o,e,t)-.008:void 0,m=(t,n,r)=>{let i=f.map(e=>e.clone().setY(e.y+n));e.add(Ge(i,t,{samples:Math.max(i.length*3,24),clip:p}),r);for(let[n,a]of[[u,i[0]],[d,i[i.length-1]]])n||e.add(new vt(t/2,16).rotateX(-Math.PI/2),r,G(a.x,a.y,a.z))};(i.verge??!0)&&m(n+.04,-.002,Xo(r,e.ground,.55)),m(n,0,r)}function is(e,t,n){let r=1/0;for(let i=0,a=e.length-1;i<e.length;a=i++){let o=e[a].x,s=e[a].y,c=e[i].x,l=e[i].y,u=c-o,d=l-s,f=u*u+d*d||1,p=Math.max(0,Math.min(1,((t-o)*u+(n-s)*d)/f)),m=Math.hypot(o+u*p-t,s+d*p-n);m<r&&(r=m)}return Ho(e,t,n)?r:-r}function as(e,t,n){let r=t.x,i=t.z;for(let t=0;t<24;t++){let t=is(e,r,i);if(t>=n)break;let a=.015,o=is(e,r+a,i)-t,s=is(e,r,i+a)-t,c=Math.hypot(o,s)||1,l=Math.max(.012,n-t);r+=o/c*l,i+=s/c*l}return new H(r,t.y,i)}function os(e,t,n,r,i=.16,a=!1){if(t.length<2)return t;let o=n/2+.025,s=(t,n)=>{let a=is(e,t.x,t.z);return!r&&a>=o+i?t:ss(e,t,n,o)},c=t[0].clone().sub(t[1]),l=t[t.length-1].clone().sub(t[t.length-2]),u=[a?t[0]:s(t[0],c),...t.slice(1,-1).map(t=>as(e,t,o*.35)),s(t[t.length-1],l)],d=new T(u,!1,`catmullrom`,.15),f=Math.max(10,Math.round(d.getLength()*14));return d.getSpacedPoints(f).map(t=>as(e,t,.02))}function ss(e,t,n,r){let i=n.clone();if(i.y=0,i.lengthSq()<1e-8)return as(e,t,r);i.normalize();let a=is(e,t.x,t.z)<r?-1:1,o=t.clone();for(let n=.012;n<1.8;n+=.012){let s=t.clone().addScaledVector(i,a*n),c=is(e,s.x,s.z);if(a<0?c>=r:c<=r)return s.setY(t.y);c>0&&(o=s)}return o.setY(t.y)}function cs(e,t,n=0){let r=e[0],i=1/0;for(let n of e){let e=Math.abs(Math.atan2(Math.sin(Math.atan2(n.y,n.x)-t),Math.cos(Math.atan2(n.y,n.x)-t)));e<i&&(i=e,r=n)}let a=r.length();return r.clone().multiplyScalar((a-n)/a)}var ls=`car/hatchback-sports.glb,car/sedan-sports.glb,car/sedan.glb,car/suv.glb,car/taxi.glb,city-commercial/building-a.glb,city-commercial/building-b.glb,city-commercial/building-c.glb,city-commercial/building-e.glb,city-commercial/building-f.glb,city-commercial/building-g.glb,city-commercial/building-h.glb,city-commercial/building-i.glb,city-commercial/building-j.glb,city-commercial/building-k.glb,city-commercial/building-l.glb,city-commercial/building-skyscraper-a.glb,city-commercial/building-skyscraper-b.glb,city-commercial/building-skyscraper-c.glb,city-commercial/building-skyscraper-d.glb,city-commercial/building-skyscraper-e.glb,city-commercial/detail-parasol-a.glb,city-commercial/low-detail-building-a.glb,city-suburban/building-type-a.glb,city-suburban/building-type-b.glb,city-suburban/building-type-c.glb,city-suburban/building-type-e.glb,city-suburban/building-type-k.glb,city-suburban/planter.glb,city-suburban/tree-large.glb,city-suburban/tree-small.glb,fantasy-town/cart.glb,fantasy-town/lantern.glb,fantasy-town/stall-bench.glb,fantasy-town/stall-red.glb,fantasy-town/windmill.glb,holiday/bench.glb,holiday/cabin-corner.glb,holiday/cabin-doorway.glb,holiday/cabin-roof-chimney.glb,holiday/cabin-roof-snow-chimney.glb,holiday/cabin-roof-snow.glb,holiday/cabin-roof.glb,holiday/cabin-wall-roof.glb,holiday/cabin-wall.glb,holiday/cabin-window-a.glb,holiday/cabin-window-b.glb,holiday/cabin-window-c.glb,holiday/lantern.glb,holiday/rocks-medium.glb,holiday/rocks-small.glb,holiday/sled.glb,holiday/snow-pile.glb,holiday/snowman-hat.glb,holiday/snowman.glb,holiday/tree-snow-a.glb,holiday/tree-snow-b.glb,holiday/tree-snow-c.glb,nature/bridge_woodRound.glb,nature/cactus_short.glb,nature/cactus_tall.glb,nature/campfire_logs.glb,nature/canoe.glb,nature/crop_pumpkin.glb,nature/fence_planks.glb,nature/fence_simple.glb,nature/flower_purpleA.glb,nature/flower_purpleB.glb,nature/flower_redA.glb,nature/flower_redB.glb,nature/flower_yellowA.glb,nature/flower_yellowB.glb,nature/flower_yellowC.glb,nature/log_stack.glb,nature/log_stackLarge.glb,nature/mushroom_red.glb,nature/mushroom_redGroup.glb,nature/mushroom_tan.glb,nature/mushroom_tanGroup.glb,nature/plant_bush.glb,nature/plant_bushDetailed.glb,nature/plant_bushLarge.glb,nature/plant_bushSmall.glb,nature/rock_largeA.glb,nature/rock_largeB.glb,nature/rock_largeC.glb,nature/rock_largeD.glb,nature/rock_smallA.glb,nature/rock_smallB.glb,nature/rock_smallC.glb,nature/rock_smallE.glb,nature/rock_tallA.glb,nature/rock_tallB.glb,nature/rock_tallE.glb,nature/tree_cone.glb,nature/tree_default.glb,nature/tree_default_fall.glb,nature/tree_detailed.glb,nature/tree_detailed_fall.glb,nature/tree_fat.glb,nature/tree_fat_fall.glb,nature/tree_oak.glb,nature/tree_oak_fall.glb,nature/tree_palmBend.glb,nature/tree_palmDetailedShort.glb,nature/tree_palmDetailedTall.glb,nature/tree_palmTall.glb,nature/tree_pineDefaultA.glb,nature/tree_pineDefaultB.glb,nature/tree_pineRoundA.glb,nature/tree_pineRoundC.glb,nature/tree_pineTallA.glb,nature/tree_pineTallA_detailed.glb,nature/tree_pineTallB.glb,nature/tree_pineTallB_detailed.glb,nature/tree_small_fall.glb,nature/tree_tall.glb,pirate/barrel.glb,pirate/boat-row-large.glb,pirate/boat-row-small.glb,pirate/chest.glb,pirate/crate-bottles.glb,pirate/crate.glb,pirate/flag-pirate-high.glb,pirate/rocks-sand-a.glb,pirate/rocks-sand-b.glb,pirate/rocks-sand-c.glb,survival/rock-sand-a.glb,train/train-electric-bullet-a.glb,train/train-electric-bullet-b.glb,train/train-electric-bullet-c.glb`.split(`,`),us={leafsGreen:`#5cb83a`,grass:`#6cbf3c`,leafsDark:`#2f8f46`,leafsFall:`#e8842c`},ds=new o,fs=new Map,ps=new WeakMap;async function ms(){try{let e=await fetch(`${c}kenney.pack`);if(e.ok){let t=await e.arrayBuffer(),n=new DataView(t).getUint32(0,!0),r=JSON.parse(new TextDecoder().decode(new Uint8Array(t,4,n))),i=4+n;await Promise.all(r.map(([e,n,r])=>Os(e,t.slice(i+n,i+n+r))));return}}catch(e){console.warn(`Kenney pack failed, loading models one by one`,e)}await Promise.all(ls.map(e=>Os(e)))}function hs(e){return fs.has(e)}function gs(e){let t=fs.get(e);return t?{halfX:t.halfX,halfZ:t.halfZ}:null}function X(e,t,n,r,i,a,o=0,s={}){let c=fs.get(t);if(!c)return!1;let l=G(n,r,i,s.stretch?[a*s.stretch[0],a*s.stretch[1],a*s.stretch[2]]:a,[s.tilt?.[0]??0,o,s.tilt?.[1]??0]);s.native&&l.multiply(c.native);let u=()=>{for(let[t,n]of Object.entries(c.buckets))e.bake(n,l,t);return!0},d=s.footprint??(t.includes(`campfire`)?!1:t.includes(`building`)?`structure`:`prop`);return d?e.footprint(d,u):u()}function _s(e){let t=fs.get(e);if(!t?.buckets.solid)return null;let n=new M(t.buckets.solid,Oa.solid);return n.castShadow=!0,n.receiveShadow=!0,n}function vs(e){let t=fs.get(e),n=_s(e);if(!t||!n)return null;n.matrixAutoUpdate=!1,n.matrix.copy(t.native);let r=new Le;r.add(n);let i=new Ut().setFromBufferAttribute(t.buckets.solid.attributes.position).applyMatrix4(t.native);return{object:r,min:i.min,max:i.max}}function ys(e){let t=e.image;if(!t)return null;if(ps.has(t))return ps.get(t);let n=null;try{let e=document.createElement(`canvas`);e.width=t.width,e.height=t.height;let r=e.getContext(`2d`,{willReadFrequently:!0});r.drawImage(t,0,0),n=r.getImageData(0,0,t.width,t.height)}catch{n=null}return ps.set(t,n),n}var bs=new N;function xs(e,t,n,r,i){n-=Math.floor(n),r-=Math.floor(r);let a=Math.min(e.width-1,Math.floor(n*e.width)),o=(Math.min(e.height-1,Math.floor((t.flipY?1-r:r)*e.height))*e.width+a)*4;i.setRGB(e.data[o]/255,e.data[o+1]/255,e.data[o+2]/255,E)}var Ss=[`city-commercial/`,`city-suburban/`,`city-industrial/`,`fantasy-town/`,`castle/`];function Cs(e){return e.startsWith(`holiday/`)?/window|lantern|lamp|light/.test(e):Ss.some(t=>e.startsWith(t))}var ws=new N;function Ts(e,t){ws.copy(e).convertLinearToSRGB();let n=ws.b>.78&&ws.b-ws.r>.08&&ws.r>.44&&ws.g>.6,r=t&&ws.r>.95&&ws.g>.75&&ws.b<.75;return n||r}function Es(e,t,n,r,i,a){let o=Ds(e,t,n,r);if(!o||!i)return{solid:o,glass:null};let s=o.attributes.color,c=[],l=[],u=new N;for(let e=0;e<s.count;e+=3)u.fromBufferAttribute(s,e),(Ts(u,a)?l:c).push(e);if(!l.length)return{solid:o,glass:null};let d=e=>{if(!e.length)return null;let t=new v;for(let n of Object.keys(o.attributes)){let r=o.attributes[n],i=new Float32Array(e.length*3*r.itemSize);e.forEach((e,t)=>i.set(r.array.subarray(e*r.itemSize,(e+3)*r.itemSize),t*3*r.itemSize)),t.setAttribute(n,new xe(i,r.itemSize))}return t},f={solid:d(c),glass:d(l)};return o.dispose(),f}function Ds(e,t,n,r){let i=e.geometry,a=i.index,o=i.attributes.position,s=i.attributes.normal,c=i.attributes.uv,l=Math.min(n+r,a?a.count:o.count)-n;if(l<3)return null;let u=new Float32Array(l*3),d=new Float32Array(l*3),f=new Float32Array(l*3),p=t.color.clone(),m=us[t.name];m&&!t.map&&p.set(m);let h=t.map?ys(t.map):null,g=new H,_=new H,y=new ie().copy(e.matrixWorld).invert().transpose();for(let r=0;r<l;r+=3){let i=0,l=0;for(let t=0;t<3;t++){let f=a?a.getX(n+r+t):n+r+t;g.fromBufferAttribute(o,f).applyMatrix4(e.matrixWorld),u.set([g.x,g.y,g.z],(r+t)*3),s&&(_.fromBufferAttribute(s,f).transformDirection(y),d.set([_.x,_.y,_.z],(r+t)*3)),c&&(i+=c.getX(f)/3,l+=c.getY(f)/3)}h&&t.map&&c?(xs(h,t.map,i,l,bs),bs.multiply(p)):bs.copy(p);for(let e=0;e<3;e++)f.set([bs.r,bs.g,bs.b],(r+e)*3)}let b=new v;return b.setAttribute(`position`,new xe(u,3)),s?b.setAttribute(`normal`,new xe(d,3)):b.computeVertexNormals(),b.setAttribute(`color`,new xe(f,3)),b}async function Os(e,t){if(fs.has(e))return;let n;try{let r=`${c}kenney/${e}`;n=t?await ds.parseAsync(t,r.slice(0,r.lastIndexOf(`/`)+1)):await ds.loadAsync(r)}catch(t){console.warn(`Kenney model failed: ${e}`,t);return}let r=n.scene;r.updateMatrixWorld(!0);let i=[],a=[],o=Cs(e),s=/lantern|lamp|light/.test(e);r.traverse(e=>{let t=e;if(!t.isMesh)return;let n=Array.isArray(t.material)?t.material:[t.material],r=t.geometry.groups.length?t.geometry.groups:[{start:0,count:1/0,materialIndex:0}];for(let e of r){let r=n[e.materialIndex??0];if(!r||!(`color`in r))continue;let c=Es(t,r,e.start,e.count,o,s);c.solid&&i.push(c.solid),c.glass&&a.push(c.glass)}});let l=e=>{if(!e.length)return null;let t=Ft(e);for(let t of e)t.dispose();if(!t)return null;let n=_e(t,1e-5);return t.dispose(),n},u=l(i),d=l(a);if(!u)return;let f=new Ut().setFromBufferAttribute(u.attributes.position);d&&f.union(new Ut().setFromBufferAttribute(d.attributes.position));let p=f.getSize(new H),m=1/Math.max(p.y,1e-4);for(let e of d?[u,d]:[u])e.translate(-(f.min.x+f.max.x)/2,-f.min.y,-(f.min.z+f.max.z)/2),e.scale(m,m,m);let h=new ie().makeTranslation((f.min.x+f.max.x)/2,f.min.y,(f.min.z+f.max.z)/2).multiply(new ie().makeScale(1/m,1/m,1/m));fs.set(e,{buckets:d?{solid:u,glass:d}:{solid:u},halfX:p.x*m/2,halfZ:p.z*m/2,native:h})}var ks=(()=>{let e=null;return()=>{if(e)return e;let t=[],n=(e,t)=>{let n=e/12,r=.13*Math.sin(Math.PI*Math.min(1,n*1.1))*(1-n*.3);return[t*r,.14*n-.6*n*n+Math.abs(t)*r*.35,n]};for(let e=0;e<12;e++){let r=n(e,0),i=n(e+1,0);for(let a of[-1,1]){let o=n(e,a),s=n(e+1,a);t.push(...r,...o,...s,...r,...s,...i)}}return e=new v,e.setAttribute(`position`,new xe(new Float32Array(t),3)),e.computeVertexNormals(),e}})(),As=(()=>{let e=null;return()=>e??=new g(1,1,8,Nt(10))})();function js(e,t,n,r,i={}){return e.footprint(`prop`,()=>{let a=i.height??.6,o=i.lean??e.range(0,6.28),s=[`nature/tree_palmTall.glb`,`nature/tree_palmBend.glb`,`nature/tree_palmDetailedTall.glb`,`nature/tree_palmDetailedShort.glb`];if(X(e,s[Math.floor(e.rand()*s.length)],t,n,r,a,o))return;let c=i.leanAmount??.22,l=new H(Math.cos(o),0,Math.sin(o)),u=new H(t,n,r),d=u.clone().addScaledVector(l,a*c).add(new H(0,a,0)),f=u;for(let t=1;t<=7;t++){let n=t/7,r=u.clone().addScaledVector(l,a*c*Math.sqrt(n)).add(new H(0,a*n,0));e.add(B(.85,1,7),t%2?q.trunk:q.trunkDark,ho(f,r,.045*(1-n*.3))),f=r}let p=e.range(0,6.28);for(let t=0;t<8;t++){let n=p+t/8*Math.PI*2,r=a*e.range(.62,.78);e.add(ks(),t%2?i.leaf??q.palmLeaf:q.foliage,G(d.x,d.y,d.z,[r,r,r],[-.3-e.range(0,.25),n,0]))}for(let t=0;t<3;t++){let n=t/3*6.28;e.add(F(`low`),q.trunkDark,G(d.x+Math.cos(n)*.03,d.y-.03,d.z+Math.sin(n)*.03,.028))}})}function Ms(e,t,n,r,i=.5,a=!1,o=q.pine){return e.footprint(`prop`,()=>{let s=a?[`holiday/tree-snow-a.glb`,`holiday/tree-snow-b.glb`,`holiday/tree-snow-c.glb`]:[`nature/tree_pineDefaultA.glb`,`nature/tree_pineDefaultB.glb`,`nature/tree_pineTallA_detailed.glb`,`nature/tree_pineTallB_detailed.glb`,`nature/tree_pineRoundA.glb`,`nature/tree_pineRoundC.glb`,`nature/tree_cone.glb`];if((a||o===q.pine)&&hs(s[0]))X(e,s[Math.floor(e.rand()*s.length)],t,n,r,i,e.rand()*6.28);else{e.add(B(1,1,6),q.trunkDark,G(t,n+i*.1,r,[.028,i*.2,.028]));for(let s=0;s<3;s++){let c=s/3,l=i*(.24-c*.06),u=n+i*(.16+c*.26),d=i*(.42-c*.04);e.add(xt(8),o,G(t,u,r,[l,d,l])),a&&e.add(xt(8),q.snow,G(t,u+d*.52,r,[l*.52,d*.5,l*.52]))}}})}function Ns(e,t,n,r,i=.4,a=`#f6b7d0`){return e.footprint(`prop`,()=>{e.add(B(.8,1,7),q.trunk,G(t,n+i*.22,r,[.028,i*.44,.028]));for(let[o,s,c,l]of[[0,.62,0,.32],[-.22,.52,.08,.24],[.2,.54,-.06,.26],[.05,.78,.1,.2],[-.08,.7,-.12,.18]])e.add(F(),a,G(t+o*i,n+s*i,r+c*i,i*l));e.add(F(),`#fff6f8`,G(t,n+i*.66,r,i*.12))})}function Z(e,t,n,r,i=.45,a=q.foliage){return e.footprint(`prop`,()=>{let o=a===q.red||a===`#e8642c`,s=o?[`nature/tree_oak_fall.glb`,`nature/tree_default_fall.glb`,`nature/tree_small_fall.glb`,`nature/tree_detailed_fall.glb`,`nature/tree_fat_fall.glb`]:[`city-suburban/tree-large.glb`,`city-suburban/tree-small.glb`,`nature/tree_default.glb`,`nature/tree_detailed.glb`,`nature/tree_oak.glb`,`nature/tree_fat.glb`,`nature/tree_tall.glb`];if((o||a===q.foliage)&&hs(s[0])){X(e,s[Math.floor(e.rand()*s.length)],t,n,r,i,e.rand()*6.28);return}e.add(B(.8,1,7),q.trunk,G(t,n+i*.25,r,[.035,i*.5,.035]));let c=i*.32;e.add(F(),a,G(t,n+i*.66,r,c)),e.add(F(),a,G(t-c*.75,n+i*.56,r+c*.2,c*.75)),e.add(F(),a,G(t+c*.7,n+i*.58,r-c*.1,c*.8)),e.add(F(),q.grass,G(t+c*.1,n+i*.86,r+c*.25,c*.55))})}function Ps(e,t,n,r,i=.5,a=q.foliageDark){return e.footprint(`prop`,()=>{e.add(B(1,1,6),q.trunkDark,G(t,n+.03,r,[.02,.06,.02])),e.add(F(),a,G(t,n+i*.55,r,[i*.15,i*.5,i*.15]))})}function Q(e,t,n,r,i=.08,a=q.foliage){return e.footprint(`prop`,()=>{let o=[`nature/plant_bush.glb`,`nature/plant_bushLarge.glb`,`nature/plant_bushDetailed.glb`,`nature/plant_bushSmall.glb`];a===q.foliage&&hs(o[0])?X(e,o[Math.floor(e.rand()*o.length)],t,n,r,i*2.4,e.rand()*6.28):(e.add(F(),a,G(t,n+i*.5,r,i)),e.add(F(),a,G(t-i*.8,n+i*.35,r+i*.2,i*.72)),e.add(F(),a,G(t+i*.75,n+i*.3,r+i*.1,i*.68)))})}function Fs(e,t,n,r,i=.06,a=q.rock){return e.footprint(`prop`,()=>{if(a===q.rock&&hs(`nature/rock_largeA.glb`)){let a=[`nature/rock_largeA.glb`,`nature/rock_largeB.glb`,`nature/rock_largeC.glb`,`nature/rock_largeD.glb`,`nature/rock_tallA.glb`,`nature/rock_tallB.glb`,`nature/rock_tallE.glb`];X(e,a[Math.floor(e.rand()*a.length)],t,n,r,i*1.8,e.rand()*6.28);return}let o=G(t,n+i*.3,r,[i,i*.7,i*.9],[e.rand(),e.rand()*6,0]);e.textured(go.rock,()=>e.add(je(),a,o))})}function Is(e,t,n,r,i=.3,a=9,o=q.sandLight){return e.footprint(`prop`,()=>{for(let s=0;s<a;s++){let a=e.range(0,6.28),s=e.range(0,i*.7),c=(1-s/(i*.7))*i*.9,l=i*e.range(.25,.45),u=G(t+Math.cos(a)*s,n+c+l*.4,r+Math.sin(a)*s*.7,[l,l*.85,l],[0,e.rand()*6,e.range(-.3,.3)]);e.textured(go.rock,()=>e.add(F(),o,u))}})}function Ls(e,t,n,r,i=.32,a=q.foliage){return e.footprint(`prop`,()=>{let o=i>.28?[`nature/cactus_tall.glb`,`nature/cactus_short.glb`]:[`nature/cactus_short.glb`,`nature/cactus_tall.glb`];if(a===q.foliage&&X(e,o[0],t,n,r,i,t*3))return;let s=i*.1;e.add(As(),a,G(t,n+i*.5,r,[s,i*.4,s]));for(let o of[-1,1]){let c=n+i*e.range(.35,.5),l=t+o*s*2.2;e.add(As(),a,G(t+o*s*1.2,c,r,[s*.7,s*1.3,s*.7],[0,0,Math.PI/2])),e.add(As(),a,G(l,c+i*.14,r,[s*.7,i*.12,s*.7]))}})}function Rs(e,t,n,r,i=.55){return e.footprint(`prop`,()=>{let a=new H(t,n,r),o=a.clone().add(new H(0,i*.55,0));e.add(B(.8,1,7),q.trunk,ho(a,o,.05));for(let t=0;t<3;t++){let n=t/3*6.28+e.range(0,1),r=o.clone().add(new H(Math.cos(n)*i*.3,i*e.range(.25,.4),Math.sin(n)*i*.2));e.add(B(.7,1,6),q.trunk,ho(o,r,.03)),e.add(F(),q.grass,G(r.x,r.y+.02,r.z,[i*.14,i*.1,i*.14])),e.add(F(),q.foliage,G(r.x+.03,r.y-.005,r.z+.02,[i*.1,i*.07,i*.1]))}})}function zs(e,t,n,r,i=.12,a=q.foliageDark){return e.footprint(`prop`,()=>{for(let o=0;o<9;o++){let s=o/9*6.28,c=.5+o%3*.15;e.add(xt(4),a,G(t,n,r,[i*.12,i,i*.06],[Math.sin(s)*c,0,-Math.cos(s)*c]))}})}function Bs(e,t,n,r,i,a=10,o=[q.pink,q.yellow,`#ffffff`,`#b98cff`]){for(let s=0;s<a;s++){let a=e.range(0,6.28),c=Math.sqrt(e.rand())*i;e.add(Re(1),o[s%o.length],G(t+Math.cos(a)*c,n+.012,r+Math.sin(a)*c,.016))}}function Vs(e,t,n,r,i=.5,a=q.redRock){let o=i*.13,s=e.range(-.08,.08),c=G(t,n,r,[o,i,o*.9],[0,e.rand()*6,s]);e.textured(go.rock,()=>{e.add(jt(Hs,9),a,c),e.add(F(),q.redRockDark,G(t,n+i*.04,r,[o*1.25,i*.08,o*1.15]))})}var Hs=[[1,0],[.92,.18],[1,.32],[.72,.5],[.8,.62],[.55,.78],[.42,.9],[.22,.98],[0,1]];function Us(e,t=.1){e.add(Re(0),q.snow,G(0,t*.25,0,[t,t*.7,t*.8],[0,e.rand()*6,0])),e.add(Re(0),q.ice,G(t*.3,t*.15,t*.2,[t*.6,t*.5,t*.5],[.3,e.rand()*6,0]))}function Ws(e,t,n,r=4){let i=n.clone().sub(t),a=new H().crossVectors(i,new H(0,1,0));a.lengthSq()<1e-8&&a.set(1,0,0),a.normalize();for(let i=0;i<r;i++){let o=(i+.5)/r,s=t.clone().lerp(n,o),c=.07+o*.04,l=.06+(1-o)*.05,u=(i%2?1:-1)*c*.25;e.add(Re(0),i%2?q.snow:q.ice,G(s.x,s.y+l*.25,s.z,[c,l*.7,c*.65],[.25,i*.6,.15])),e.add(V(),q.snow,G(s.x+a.x*u,s.y,s.z+a.z*u,[c*.85,l,c*.5],[.35,i*.4,.1]))}}function Gs(e,t,n,r=.22,i=.25){let a=n.clone().sub(t),o=a.length(),s=new H(-a.z,0,a.x).normalize();s.z<0&&s.negate();let c=t.clone().lerp(n,.5),l=i*1.6,u=Ks(e.rand,o,l,r);e.group(G(c.x,c.y,c.z,1,[0,Math.atan2(s.x,s.z),0]),()=>{e.add(u.geometry,q.snow);for(let t of[.16,.3,.44,.58,.72]){let n=u.halfWidth(t)*.85,r=-n+e.range(0,.04);for(;r<n-.03;){let i=Math.min(e.range(.05,.12),n-r),a=r+i/2,o=u.height(a,t)+.003,s=Math.atan2(u.height(a,t+.02)-u.height(a,t),l*.02);e.add(lt(),`#5aa6d1`,G(a,o,-t*l,[i,.006,e.range(.008,.013)],[s,e.range(-.15,.15),0])),r+=i+e.range(.02,.05)}}let t=[`#9fd9f1`,`#c6ecf7`,`#86cbea`,`#b4e3f5`,`#dff4fb`],n=Math.max(6,Math.round(o/.045));for(let i=0;i<n;i++){let a=o/n*1.08,s=r*e.range(.85,1.15),c=e.range(.05,.08),l=-o/2+(i+.5)*(o/n),u=.012-c/2+e.range(-.008,.01),d=e.range(-.06,.06);e.add(lt(),t[Math.floor(e.rand()*t.length)],G(l,s/2-.02,u,[a,s,c],[0,0,d])),e.add(V(),e.rand()<.6?q.snow:q.ice,G(l,s-.021,u,[a*.95,e.range(.025,.07),c*.95],[0,e.range(-.3,.3),d]))}})}function Ks(e,t,n,r){let i=e()*6,a=e=>t/2*(1-.45*e),o=(e,t)=>{let n=e/a(t),o=Math.sin(t*26+i+n*.8)*.008*(.4+t);return r+r*1.2*t**.8-n*n*r*.18+o},s=[],c=[],l=(e,t,n)=>s.push(e,t,n)/3-1,u=(e,t,n,r)=>c.push(e,t,n,e,n,r),d=[];for(let e=0;e<=20;e++){let t=e/20;d.push([]);for(let r=0;r<=24;r++){let i=(r/24-.5)*2*a(t);d[e].push(l(i,o(i,t),-t*n))}}for(let e=0;e<20;e++)for(let t=0;t<24;t++)u(d[e][t],d[e][t+1],d[e+1][t+1],d[e+1][t]);let f=e=>{for(let t=0;t<e.length-1;t++){let n=e[t],r=e[t+1],i=l(s[n*3],-.02,s[n*3+2]),a=l(s[r*3],-.02,s[r*3+2]);u(n,i,a,r)}};f(d[0]),f(d.map(e=>e[24])),f(d.map(e=>e[0]).reverse());let p=new v;return p.setAttribute(`position`,new xe(new Float32Array(s),3)),p.setIndex(c),p.computeVertexNormals(),{geometry:p,halfWidth:a,height:o}}var qs=[`city-suburban/building-type-a.glb`,`city-suburban/building-type-c.glb`,`city-suburban/building-type-e.glb`,`city-suburban/building-type-k.glb`];function Js(e,t,n,r,i){let a=i.faces??[`front`,`right`],[o,s]=i.fill??[.5,.55],[c,l]=i.band??[.08,.92];for(let u of a){let a=u===`front`||u===`back`?t:r,d=a/i.cols,f=n*(l-c)/i.rows,p=d*o,m=f*s;for(let o=+!!i.skipGround;o<i.rows;o++)for(let s=0;s<i.cols;s++){let l=-a/2+d*(s+.5),h=n*c+f*(o+.5),g=Be(p,m,i.rounded?p/2:Math.min(p,m)*.15,.016),_=i.paint??q.windowBlue;u===`front`?e.add(g,_,G(l,h,r/2+.002),`glass`):u===`back`?e.add(g,_,G(-l,h,-r/2-.002),`glass`):u===`right`?e.add(g,_,G(t/2+.002,h,-l,1,[0,Math.PI/2,0]),`glass`):e.add(g,_,G(-t/2-.002,h,l,1,[0,Math.PI/2,0]),`glass`)}}}function Ys(e,t,n,r,i){let a=i.paint??q.terracotta,o=i.overhang??.03,s=i.height??Math.min(t,n)*.45;switch(i.kind){case`hip`:e.add(V(),a,G(0,r,0,[t+o*2,s,n+o*2]));break;case`gable`:e.add(Ue(),a,G(0,r,0,[t+o*2,s,n+o*2]));break;case`gableX`:e.add(Ue(),a,G(0,r,0,[n+o*2,s,t+o*2],[0,Math.PI/2,0]));break;case`flat`:e.add(z(t+o*2,.03,n+o*2,.01),a,G(0,r+.015,0));break;case`dome`:e.add(wt(),a,G(0,r,0,[t*.48,s,n*.48]));break;case`cone`:e.add(xt(10),a,G(0,r,0,[Math.max(t,n)*.62,s,Math.max(t,n)*.62]))}}function $(e,t,n,r,i){return e.footprint(`structure`,()=>{e.group(G(t,n,r,1,[0,i.ry??0,0]),()=>{if(e.add(z(i.w,i.h,i.d,i.soft??.015),i.paint,G(0,i.h/2,0)),i.trim&&e.add(z(i.w+.02,.03,i.d+.02,.01),i.trim,G(0,i.h-.01,0)),i.windows&&Js(e,i.w,i.h,i.d,i.windows),i.door!==!1){let t=Math.min(.12,i.h*.4);e.add(z(Math.min(.07,i.w*.3),t,.02,.008),i.door??q.woodDark,G(0,t/2,i.d/2+.002))}i.roof&&Ys(e,i.w,i.d,i.h,i.roof)})})}function Xs(e,t,n,r,i,a=.045){let o=(t,n,o)=>{let s=Math.max(2,Math.round(t/(a*2)));for(let c=0;c<s;c++){let l=-t/2+t/s*(c+.5),u=o?G(l,r+a/2,n):G(n,r+a/2,l);e.add(z(a,a,a,.008),i,u)}};o(t,n/2-a/2,!0),o(t,-n/2+a/2,!0),o(n-a*2,t/2-a/2,!1),o(n-a*2,-t/2+a/2,!1)}function Zs(e,t,n,r,i){return e.footprint(`structure`,()=>{let a=i.d??i.w;$(e,t,n,r,{w:i.w,h:i.h,d:a,paint:i.paint,ry:i.ry,windows:i.windows,roof:i.roof,door:i.door??!1}),i.crenellated&&e.group(G(t,n,r,1,[0,i.ry??0,0]),()=>Xs(e,i.w+.02,a+.02,i.h,i.paint))})}function Qs(e,t,n,r,i,a=.06,o=!0){let s=n.clone().sub(t),c=s.length(),l=t.clone().add(n).multiplyScalar(.5),u=-Math.atan2(s.z,s.x);e.group(G(l.x,l.y,l.z,1,[0,u,0]),()=>{if(e.add(z(c,r,a,.01),i,G(0,r/2,0)),o){let t=Math.max(2,Math.round(c/.09));for(let n=0;n<t;n++)e.add(z(.045,.045,a,.008),i,G(-c/2+c/t*(n+.5),r+.022,0))}})}function $s(e,t,n,r,i){return e.footprint(`structure`,()=>{let a=qs.filter(e=>hs(e));if(a.length){let o=a[Math.abs(Math.round(t*17+r*11))%a.length],s=Math.max(.22,i.w/1.3);return X(e,o,t,n,r,s,i.ry??0),new H(t,n+s*.92,r)}let o=new H;return e.group(G(t,n,r,1,[0,i.ry??0,0]),()=>{let t=Math.max(3,Math.round(i.h/.035)),n=i.h/t/2;for(let r=0;r<t;r++){let t=n+r*n*2,a=r%2?q.log:q.wood;e.add(B(1,1,7),a,G(0,t,i.d/2-n,[n,i.w+.03,n],[0,0,Math.PI/2])),e.add(B(1,1,7),a,G(0,t,-i.d/2+n,[n,i.w+.03,n],[0,0,Math.PI/2])),e.add(B(1,1,7),a,G(i.w/2-n,t,0,[n,i.d,n],[Math.PI/2,0,0])),e.add(B(1,1,7),a,G(-i.w/2+n,t,0,[n,i.d,n],[Math.PI/2,0,0]))}e.add(lt(),q.log,G(0,i.h/2,0,[i.w-n*3,i.h,i.d-n*3])),e.add(z(.06,i.h*.6,.02,.006),q.woodDark,G(-i.w*.18,i.h*.3,i.d/2+.005)),e.add(z(.07,.06,.02,.006),q.windowBlue,G(i.w*.2,i.h*.55,i.d/2+.005),`glass`);let r=i.d*.45;e.add(Ue(),i.roof??q.roofRed,G(0,i.h,0,[i.d+.08,r,i.w+.08],[0,Math.PI/2,0])),i.snow&&e.add(Ue(),q.snow,G(0,i.h+.025,0,[i.d+.06,r*.95,i.w+.1],[0,Math.PI/2,0]));let a=i.w*.25,s=-i.d*.12,c=i.h+r*.95;e.add(z(.05,c-i.h*.6,.05,.008),q.rockDark,G(a,i.h*.6+(c-i.h*.6)/2,s)),o.set(a,c,s).applyMatrix4(e.top)}),o})}function ec(e,t,n,r,i=.8,a=.1,o=q.cream){e.add(B(.72,1,4),o,G(t,n+i*.45,r,[a*.7,i*.9,a*.7],[0,Math.PI/4,0])),e.add(V(),o,G(t,n+i*.9,r,[a*.72,i*.1,a*.72]))}function tc(e,t,n,r,i,a,o=q.white){e.add(B(1,1,16),o,G(t,n+i*.25,r,[i*.9,i*.5,i*.9])),e.add(wt(),a,G(t,n+i*.5,r,i)),e.add(B(1,1,8),o,G(t,n+i*1.55,r,[i*.16,i*.24,i*.16])),e.add(F(),a,G(t,n+i*1.72,r,i*.12))}function nc(e,t,n,r,i=q.white,a=.022){for(let o=0;o<r;o++){let s=t.clone().lerp(n,r===1?.5:o/(r-1));e.add(B(1,1,6),i,G(s.x,s.y+a*.6,s.z,[a*.5,a*1.2,a*.5])),e.add(F(`low`),i,G(s.x,s.y+a*1.5,s.z,a*.75))}}function rc(e,t,n,r,i=.16,a=`#8a8f4a`){e.add(z(i*.4,i*.25,i*.4,.01),q.cream,G(t,n+i*.125,r)),e.add(B(.6,1,8),a,G(t,n+i*.5,r,[i*.14,i*.55,i*.14])),e.add(F(),a,G(t,n+i*.85,r,i*.09)),e.add(B(1,1,5),a,ho(new H(t+i*.08,n+i*.65,r),new H(t+i*.3,n+i*.9,r),i*.03))}function ic(e,t,n,r=.14,i=.1,a=q.cream){let o=n.clone().sub(t),s=o.length(),c=new Te;c.moveTo(-s/2,0),c.quadraticCurveTo(0,i*2.2,s/2,0),c.lineTo(s/2,-.05),c.lineTo(-s/2,-.05),c.closePath();let l=new we;l.absarc(0,-.05,s*.28,0,Math.PI,!1),c.holes.push(l);let u=new _t(c,{depth:r,bevelEnabled:!0,bevelSize:.01,bevelThickness:.01,bevelSegments:1,curveSegments:10});u.translate(0,0,-r/2);let d=t.clone().add(n).multiplyScalar(.5);e.add(u,a,G(d.x,d.y,d.z,1,[0,-Math.atan2(o.z,o.x),0]))}function ac(e,t,n,r){let i=r.paint??`#d9532b`,a=r.width??.1,o=n.clone().sub(t),s=o.length(),c=t.clone().add(n).multiplyScalar(.5);e.group(G(c.x,0,c.z,1,[0,-Math.atan2(o.z,o.x),0]),()=>{e.add(z(s,.03,a,.006),i,G(0,r.deckY,0));let t=[-s*.27,s*.27];for(let n of t){for(let t of[-1,1])e.add(z(.03,r.towerH,.03,.006),i,G(n,r.towerH/2,t*a*.45));e.add(z(.03,.025,a,.006),i,G(n,r.towerH*.92,0)),e.add(z(.03,.025,a,.006),i,G(n,r.deckY-.04,0)),e.add(B(1,1,8),q.rockDark,G(n,(r.deckY-.05)/2-.1,0,[.04,r.deckY+.1,.04]))}for(let n of[-1,1]){let o=n*a*.45,c=e=>{let n=t[0],i=t[1];if(e<n)return r.deckY+(e+s/2)/(n+s/2)*(r.towerH*.92-r.deckY);if(e>i)return r.deckY+(s/2-e)/(s/2-i)*(r.towerH*.92-r.deckY);let a=(e-n)/(i-n);return r.deckY+.03+(r.towerH*.92-r.deckY-.03)*(2*a-1)**2},l=[];for(let e=0;e<=16;e++){let t=-s/2+s*e/16;l.push(new H(t,c(t),o))}e.add(Rt(l,.007,4),i);for(let t=1;t<16;t++){let n=-s/2+s*t/16,a=c(n);a-r.deckY>.02&&e.add(B(1,1,3),i,G(n,(a+r.deckY)/2,o,[.003,a-r.deckY,.003]))}}})}function oc(e,t,n=q.white,r=.07){for(let i=0;i<t.length-1;i++){let a=t[i],o=t[i+1],s=a.distanceTo(o),c=Math.max(2,Math.round(s/.035));for(let t=0;t<=c;t++){let i=a.clone().lerp(o,t/c);e.add(z(.014,r,.01,.004),n,G(i.x,i.y+r/2,i.z,1,[0,-Math.atan2(o.z-a.z,o.x-a.x),0]))}for(let t of[.35,.75])e.add(B(1,1,4),n,ho(a.clone().setY(a.y+r*t),o.clone().setY(o.y+r*t),.006))}}function sc(e,t,n,r,i,a,o=q.white,s=q.pool,c=0){return e.footprint(`structure`,()=>{e.group(G(t,n,r,1,[0,c,0]),()=>{e.add(z(i+.06,.03,a+.06,.012),o,G(0,.005,0)),e.add(lt(),s,G(0,.022,0,[i,.002,a]),`water`)})})}function cc(e,t,n,r,i,a={}){let o=r.clone().sub(n).setY(0).normalize(),s=n.clone();for(let e=0;e<2;e+=.005){let r=n.clone().addScaledVector(o,e);if(t(r.x,r.z)){s=r;break}}return lc(e,s.clone().addScaledVector(o,-.07),s.clone().addScaledVector(o,i),a.width??.1,a.paint??q.wood,a.floor)}function lc(e,t,n,r=.12,i=q.wood,a){return e.footprint(`structure`,()=>{let o=n.clone().sub(t),s=o.length(),c=-Math.atan2(o.z,o.x),l=Math.max(3,Math.round(s/.04));for(let a=0;a<l;a++){let o=t.clone().lerp(n,(a+.5)/l);e.add(z(s/l-.006,.018,r,.004),a%2?i:q.wood,G(o.x,o.y,o.z,1,[0,c,0]))}let u=new H(-o.z,0,o.x).normalize().multiplyScalar(r/2-.01);for(let r of[.25,.65,1]){let i=t.clone().lerp(n,r),o=a??i.y-.15,s=i.y+.01-o;for(let t of[-1,1]){let n=i.clone().addScaledVector(u,t);e.add(B(1,1,6),q.woodDark,G(n.x,o+s/2,n.z,[.012,s,.012]))}}})}function uc(e,t,n,r,i=0,a=q.white){e.group(G(t,n,r,1,[0,i,0]),()=>{e.add(z(.06,.012,.15,.004),a,G(0,.03,.02)),e.add(z(.06,.012,.07,.004),a,G(0,.06,-.075,1,[.7,0,0]));for(let t of[-1,1])for(let n of[-.04,.07])e.add(lt(),q.woodDark,G(t*.025,.012,n,[.008,.025,.008]))})}function dc(e,t,n,r,i=0,a=q.ochre){e.group(G(t,n,r,1,[0,i,0]),()=>{e.add(z(.06,.012,.06,.004),a,G(0,.03,0)),e.add(z(.06,.07,.012,.004),a,G(0,.065,-.03,1,[-.3,0,0]));for(let t of[-1,1])e.add(z(.01,.03,.06,.003),a,G(t*.032,.015,0))})}function fc(e,t,n,r){if(!X(e,`nature/campfire_logs.glb`,t,n,r,.045)){for(let i=0;i<8;i++){let a=i/8*6.28;e.add(F(`low`),q.rockDark,G(t+Math.cos(a)*.05,n+.01,r+Math.sin(a)*.05,[.018,.014,.018]))}for(let i=0;i<3;i++)e.add(B(1,1,5),q.woodDark,G(t,n+.015,r,[.01,.08,.01],[Math.PI/2,i/3*Math.PI,0]))}}function pc(e,t,n,r,i=0){let a=[q.red,q.yellow,q.teal,q.pink,`#7d5cff`];e.group(G(t,n,r,1,[0,i,0]),()=>{e.add(z(.16,.24,.04,.01),q.stucco,G(0,.12,0,1,[-.12,0,0]));for(let t=0;t<9;t++)e.add(F(`low`),a[t%a.length],G(e.range(-.06,.06),e.range(.03,.22),.025-t*5e-4,.011))})}function mc(e,t,n=.05){let r=e.shore,i=r?t.map(e=>is(r,e.x,e.z)<.04?as(r,e,.05):e):t;for(let t=0;t<i.length-1;t++){let r=i[t],a=i[t+1],o=a.clone().sub(r),s=new H(-o.z,0,o.x).normalize().multiplyScalar(n/2);for(let t of[-1,1])e.add(B(1,1,4),q.metal,ho(r.clone().addScaledVector(s,t).setY(r.y+.006),a.clone().addScaledVector(s,t).setY(a.y+.006),.004));let c=Math.max(1,Math.round(o.length()/.03));for(let t=0;t<c;t++){let i=r.clone().lerp(a,(t+.5)/c);e.add(lt(),q.woodDark,G(i.x,i.y+.002,i.z,[n*1.5,.006,.01],[0,-Math.atan2(o.z,o.x)+Math.PI/2,0]))}}}function hc(e,t,n,r,i,a=q.roofOrange,o=0){e.add(z(i,.015,.06,.005),a,G(t,n,r,1,[.35,o,0]))}var gc=new Map;function _c(e,t=.6){let n=`${e}|${t}`,r=gc.get(n);return r||gc.set(n,r=new pe({color:e,roughness:t})),r}var vc=[`#e94b3c`,`#f5c542`,`#2f74c8`,`#3fae5f`,`#f08bb4`,`#ff8c3a`];function yc(e,t,n,r,i={}){let a=i.y??.36,o=a+r+.06,s=i.ry??0,c=.03,l=i.frameColor??`#c8ccd4`;e.footprint(`structure`,()=>{e.group(G(t,a,n,1,[0,s,0]),()=>{let t=i.frame===`back`?[-1]:[-1,1];for(let n of t)for(let t of[-1,1]){let s=new H(t*r*.55,0,n*.045+(i.frame===`back`?-.08:0)),c=new H(0,o-a,n*.045);e.add(B(1,1,6),l,ho(s,c,.008))}e.add(z(r*1.3,.03,.14,.008),`#7d6a58`,G(0,.015,0))})});let u=i.count??12,d=i.gondolas??vc,f=i.pods===`capsule`,p=_c(i.rim??`#f4f6fa`,.5);e.part(()=>{let e=new Le,t=new Le;e.add(t);for(let e of[-1,1]){let n=new M(new Pe(r,.006,5,48),p);n.position.z=e*c,t.add(n)}let n=new dt(.0025,.0025,r,4).translate(0,r/2,0),a=[],o=f?new ue(.02,10,8).scale(1.5,1,1):new dt(.022,.018,.03,8);for(let r=0;r<u;r++){let i=r/u*Math.PI*2;for(let e of[-1,1]){let r=new M(n,p);r.rotation.z=i,r.position.z=e*c,t.add(r)}let s=new M(o,_c(d[r%d.length],f?.25:.7));e.add(s),a.push(s)}e.add(new M(new dt(.018,.018,.1,10).rotateX(Math.PI/2),p));let s=i.speed??.25;return{object:e,update(e){let n=e*s;t.rotation.z=n,a.forEach((e,t)=>{let i=n+t/u*Math.PI*2+Math.PI/2;e.position.set(Math.cos(i)*r,Math.sin(i)*r-(f?0:.02),0)})}}},G(t,o,n,1,[0,s,0]))}function bc(e,t,n,r,i=[`#e94b3c`,`#f4f6fa`]){e.footprint(`structure`,()=>{e.add(B(1,1,16),`#7d6a58`,G(t,J+.01,n,[.12,.02,.12])),e.add(B(1,1,8),`#c8ccd4`,G(t,J+r/2,n,[.012,r,.012]))});let a=.09;e.part(()=>{let e=new Le;for(let t=0;t<10;t++){let n=new M(new dt(.004,.11,.05,2,1,!0,t/10*Math.PI*2,Math.PI*2/10),_c(i[t%2]));n.position.y=.03,e.add(n)}let t=new dt(.0015,.0015,.1,3).translate(0,-.05,0),n=new dt(.012,.012,.008,6).translate(0,-.1,0);for(let r=0;r<10;r++){let i=new Le,o=r/10*Math.PI*2;i.position.set(Math.cos(o)*a,0,Math.sin(o)*a),i.rotation.y=-o,i.rotation.z=.75,i.add(new M(t,_c(`#f4f6fa`)),new M(n,_c(`#f5c542`))),e.add(i)}return{object:e,update(t){e.rotation.y=-t*1.4}}},G(t,J+r,n))}function xc(e,t,n,r,i=q.red,a=.08){let o=t.distanceTo(n)/a;e.part(()=>{let e=new Le,a=new M(new dt(.002,.002,.04,3).translate(0,-.02,0),_c(`#5b6270`)),s=new M(new dt(.03,.03,.04,6).translate(0,-.06,0),_c(i,.4)),c=new M(new dt(.031,.031,.016,6).translate(0,-.055,0),_c(`#6fa8d6`,.2));e.add(a,s,c);let l=new H,u=Math.random()*10;return{object:e,update(i){let a=o+1.5,s=(i+u)%(a*2),c=s<a?Math.min(1,s/o):1-Math.min(1,(s-a)/o),d=c*c*(3-2*c);l.copy(t).lerp(n,d),l.y-=Math.sin(d*Math.PI)*r,e.position.copy(l)}}})}function Sc(e,t,n,r={}){let i=new T(t),a=r.from??.2,o=r.to??.8,s=[];for(let e=0;e<=12;e++){let t=i.getPoint(a+(o-a)*e/12);s.push(t.setY(r.y??t.y+.004))}Po(e,n,s,{speed:r.speed??.07,pingPong:!0,dwell:1.2})}function Cc(e){let t=`#6b3f22`,n=[new P(.22,0),new P(.14,.05),new P(-.13,.06),new P(-.18,.05),new P(-.18,-.05),new P(-.13,-.06),new P(.14,-.05)];e.add(Vt(n,-.02,.045,.008,.2),t),e.add(Vt(n.map(e=>e.clone().multiplyScalar(.92)),.04,.05,.003),`#a0703f`),e.add(z(.07,.04,.11,.008),t,G(-.145,.06,0)),e.add(z(.05,.012,.115,.003),`#4a2a16`,G(-.145,.085,0)),e.add(z(.05,.02,.07,.006),t,G(.17,.05,0,1,[0,0,.25]));let r=[[.02,1],[.13,.72],[-.12,.55]],i=[new P(.03,0),new P(.04,.12),new P(.02,.22),new P(-.03,.27),new P(-.13,.25),new P(-.12,.12),new P(-.09,0)];for(let[t,n]of r){let r=t<-.1?.08:.06;e.add(B(1,1,5),`#3a2414`,G(t,r+.15*n,0,[.004,.3*n+.02,.004])),e.add(Vt(i.map(e=>e.clone().multiplyScalar(n)),-.003,.003,.001),`#c0392b`,G(t,r+.01,.008,1,[-Math.PI/2,0,0]));for(let i=1;i<=4;i++)e.add(lt(),`#4a2216`,G(t-.045*n,r+.01+.055*i*n,.012,[.17*n,.004,.003]))}}function wc(e){e.add(z(.34,.035,.07,.016),`#8a5a36`,G(0,.018,0)),e.add(z(.06,.05,.05,.012),`#8a5a36`,G(.17,.035,0,1,[0,0,.5]));for(let t of[-.08,.06])for(let n of[-1,1])e.add(B(1,1,4),`#5a3a22`,G(t,.06,n*.026,[.003,.05,.003]));e.add(z(.2,.008,.08,.003),`#e94b6c`,G(-.01,.086,0)),e.add(B(1,1,4),q.metal,ho(new H(-.16,.04,0),new H(-.3,0,0),.004)),e.add(z(.04,.03,.03,.006),`#4a4f58`,G(-.17,.05,0))}var Tc=[[-1,-1],[1,-1],[1,1],[-1,1]];function Ec(e,t,n,r,i){return e.footprint(`structure`,()=>{let a=i.w??.2,o=i.d??a*.82,s=i.glass??q.windowBlue,c=[0,...i.setbacks??[.64],1];e.group(G(t,n,r),()=>{for(let t=0;t<c.length-1;t++){let n=i.h*c[t],r=i.h*(c[t+1]-c[t]),l=1-t*.18,u=a*l,d=o*l,f=Math.max(2,Math.round(r*11));e.group(G(0,n,0),()=>{e.add(z(u,r,d,.01),i.paint,G(0,r/2,0)),Js(e,u,r,d,{rows:f,cols:i.cols??2,paint:s,fill:[.55,.4],faces:[`front`,`right`,`left`]}),e.add(z(u+.016,.012,d+.016,.004),i.paint,G(0,r-.006,0))})}let t=i.crown??`flat`,n=a*(1-(c.length-2)*.18);t===`antenna`?(e.add(B(1,1,6),q.metal,G(0,i.h+.08,0,[.012,.16,.012])),e.add(F(),q.red,G(0,i.h+.17,0,.014))):t===`slant`?e.add(Ue(),i.paint,G(0,i.h,0,[n*.85,i.h*.14,n*.7])):t===`dome`&&e.add(wt(),s,G(0,i.h,0,[n*.42,n*.32,n*.42]),`glass`)})})}function Dc(e,t,n,r,i={}){return e.footprint(`structure`,()=>{let a=i.h??.9,o=i.base??a*.2,s=i.paint??`#e23b2f`,c=i.accent??q.white;e.group(G(t,n,r),()=>{let t=e=>o*(1-e*.78),n=(e,n,r)=>K(n*t(e),a*e,r*t(e));for(let r=0;r<5;r++){let i=r/5,o=(r+1)/5,l=r%2?s:c;for(let[t,r]of Tc)e.add(B(1,1,5),l,ho(n(i,t,r),n(o,t,r),.009));for(let t=0;t<4;t++){let r=Tc[t],a=Tc[(t+1)%4];e.add(B(1,1,4),s,ho(n(i,r[0],r[1]),n(o,a[0],a[1]),.0045)),e.add(B(1,1,4),s,ho(n(i,a[0],a[1]),n(o,r[0],r[1]),.0045))}let u=a*o,d=t(o);for(let t=0;t<4;t++){let n=Tc[t],r=Tc[(t+1)%4];e.add(B(1,1,4),c,ho(K(n[0]*d,u,n[1]*d),K(r[0]*d,u,r[1]*d),.0055))}}for(let n of[.46,.74]){let r=t(n)*1.35;e.add(B(1,1,16),c,G(0,a*n,0,[r,.012,r])),e.add(B(1,1,16),s,G(0,a*n+.016,0,[r*.72,.018,r*.72]))}e.add(B(1,1,8),c,G(0,a+.055,0,[.016,.12,.016])),e.add(xt(8),s,G(0,a+.14,0,[.018,.09,.018]))})})}function Oc(e,t,n,r,i={}){return e.footprint(`structure`,()=>{let a=i.h??.85,o=i.w??.18,s=i.paint??`#e0b57a`,c=i.roof??`#3d4254`;e.group(G(t,n,r),()=>{let t=a*.7;e.add(z(o,t,o,.01),s,G(0,t/2,0)),Js(e,o,t,o,{rows:4,cols:1,paint:q.windowBlue,band:[.1,.62],faces:[`front`,`right`,`left`,`back`]});let n=a*.74;for(let t=0;t<4;t++)e.group(G(0,n,0,1,[0,t*Math.PI/2,0]),()=>{e.add(B(1,1,16),s,G(0,0,o/2+.004,[o*.36,.012,o*.36],[Math.PI/2,0,0])),e.add(B(1,1,16),q.white,G(0,0,o/2+.011,[o*.26,.006,o*.26],[Math.PI/2,0,0])),e.add(z(.006,o*.16,.004,.001),q.black,G(.003,o*.03,o/2+.015)),e.add(z(o*.1,.005,.004,.001),q.black,G(o*.03,0,o/2+.015))});for(let[t,n]of Tc)e.add(z(.02,a*.1,.02,.004),s,G(o*.38*t,a*.82,o*.38*n)),e.add(xt(6),c,G(t*o*.4,a*.9,n*o*.4,[.018,.07,.018]));e.add(xt(10),c,G(0,a*.88,0,[o*.62,a*.22,o*.62]))})})}function kc(e,t,n,r,i=.85,a=q.white){return e.footprint(`structure`,()=>{e.add(B(.7,1,12),a,G(t,n+i*.32,r,[i*.07,i*.64,i*.07])),e.add(z(i*.22,.02,i*.22,.004),a,G(t,n+i*.7,r)),e.add(F(),`#e7eef2`,G(t,n+i*.8,r,[i*.13,i*.09,i*.13])),e.add(xt(8),q.red,G(t,n+i*.92,r,[i*.028,i*.12,i*.028]))})}function Ac(e,t,n,r,i=.7,a=q.cream,o=`#5a6a7a`){return e.footprint(`structure`,()=>{e.group(G(t,n,r),()=>{e.add(B(1,1,12),a,G(0,i*.26,0,[i*.13,i*.52,i*.13]));for(let t=0;t<4;t++){let n=t/4*Math.PI*2;e.add(z(.018,i*.07,.008,.003),q.windowBlue,G(Math.cos(n)*i*.07,i*.32,Math.sin(n)*i*.07),`glass`)}e.add(F(),o,G(0,i*.58,0,[i*.15,i*.18,i*.15])),e.add(xt(10),o,G(0,i*.74,0,[i*.035,i*.14,i*.035])),e.add(F(),`#f0d24a`,G(0,i*.86,0,i*.018))})})}function jc(e,t,n,r,i=.55){return e.footprint(`structure`,()=>{e.group(G(t,n,r),()=>{e.add(z(i*.72,i*.07,i*.72,.008),q.white,G(0,i*.035,0)),e.add(z(i*.52,i*.05,i*.52,.006),q.white,G(0,i*.09,0)),e.add(wt(),q.white,G(0,i*.14,0,i*.2)),e.add(z(i*.12,i*.07,i*.12,.004),`#f0d24a`,G(0,i*.36,0));for(let t=0;t<7;t++){let n=t/7,r=i*(.07-n*.04);e.add(B(1,1,12),`#f0d24a`,G(0,i*(.42+n*.26),0,[r,.012,r]))}e.add(xt(8),`#f5dc6a`,G(0,i*.72,0,[i*.028,i*.14,i*.028])),e.add(F(),`#f5dc6a`,G(0,i*.86,0,i*.02))})})}function Mc(e,t,n,r,i=.6){return e.footprint(`structure`,()=>{e.group(G(t,n,r),()=>{e.add(z(i*.34,i*.05,i*.34,.006),`#f3e2b0`,G(0,i*.025,0));let t=i*.05;for(let n=0;n<5;n++){let r=n/4,a=i*(.24-r*.04),o=i*(.26-r*.04);e.add(V(),n%2?`#f0d56a`:`#f7ead0`,G(0,t,0,[o,a,o])),t+=a*.58}e.add(xt(8),`#f5dc6a`,G(0,t,0,[i*.018,i*.1,i*.018])),e.add(F(),`#f5dc6a`,G(0,t+i*.1,0,i*.012))})})}function Nc(e,t,n,r,i,a,o=.14,s=q.cream){for(let c=0;c<a;c++){let l=a===1?0:-i/2+i/(a-1)*c;e.add(z(.022,o*.4,.022,.004),s,G(t+l,n+o*.2,r)),e.add(xt(6),s,G(t+l,n+o*.4,r,[.016,o*.6,.016]))}}function Pc(e,t,n,r,i=.55,a=.45,o=q.cream){return e.footprint(`structure`,()=>{for(let s of[-1,1])e.add(z(i*.22,a*.85,i*.22,.01),o,G(t+s*i*.36,n+a*.42,r)),e.add(xt(8),o,G(t+s*i*.36,n+a*.85,r,[i*.1,a*.22,i*.1])),e.add(z(i*.08,a*.16,.012,.02),q.windowBlue,G(t+s*i*.36,n+a*.4,r+i*.12),`glass`);e.add(z(i*.78,a*.1,i*.26,.008),o,G(t,n+a*.7,r)),ic(e,K(t-i*.22,n+.02,r),K(t+i*.22,n+.02,r),i*.18,a*.32,o)})}function Fc(e,t,n,r){return e.footprint(`structure`,()=>{$(e,t,n,r,{w:.28,h:.2,d:.2,paint:q.cream,windows:{rows:1,cols:2,paint:q.windowBlue},roof:{kind:`flat`,paint:q.rock},door:!1}),e.add(B(1,1,12),q.cream,G(t-.06,n+.22,r,[.055,.04,.055])),e.add(B(1,1,12),q.cream,G(t+.07,n+.21,r+.02,[.045,.035,.045])),e.add(wt(),q.white,G(t-.06,n+.24,r,.07)),e.add(wt(),q.white,G(t+.07,n+.23,r+.02,.058))})}function Ic(e,t,n,r=q.red){let i=.07,a=r=>{let a=[];for(let e=0;e<=8;e++){let o=e/8,s=t.clone().lerp(n,o);s.y-=Math.sin(o*Math.PI)*i,s.x+=r,a.push(s)}for(let t=0;t<a.length-1;t++)e.add(B(1,1,4),q.metal,ho(a[t],a[t+1],.0035));return a[4]};a(-.02),a(.02);for(let r of[t,n])e.add(z(.03,.22,.03,.005),q.metal,G(r.x,r.y-.08,r.z));xc(e,t,n,i,typeof r==`string`?r:q.red)}function Lc(e,t,n,r){return e.footprint(`structure`,()=>{e.group(G(t,n,r),()=>{for(let[t,n]of Tc)e.add(B(1,1,6),q.woodDark,G(t*.1,.08,n*.07,[.012,.16,.012]));e.add(z(.22,.035,.14,.008),q.wood,G(0,.1,0)),e.add(xt(12),q.ochre,G(0,.16,0,[.2,.12,.16])),e.add(xt(12),q.sandDark,G(0,.22,0,[.14,.08,.11]));for(let t of[-1,1])e.add(B(1,1,6),q.wood,G(t*.07,.035,.12,[.012,.07,.012]))})})}function Rc(e,t,n,r){return e.footprint(`structure`,()=>{e.add(z(.07,.15,.07,.006),q.red,G(t,n+.075,r)),e.add(z(.046,.07,.008,.004),q.windowBlue,G(t,n+.085,r+.036),`glass`),e.add(z(.08,.012,.08,.003),q.red,G(t,n+.156,r)),e.add(F(),q.yellow,G(t,n+.17,r,.012))})}function zc(e,t,n,r,i){for(let a of t)for(let t of[-1,1])e.add(B(1,1,12),q.black,G(a,r,t*n,[r,i,r],[Math.PI/2,0,0])),e.add(B(1,1,8),`#d8dde3`,G(a,r,t*(n+i*.5+.001),[r*.55,.004,r*.55],[Math.PI/2,0,0]))}var Bc=e=>e.map(([e,t])=>new P(e,t)),Vc=Bc([[-.24,.035],[.24,.035],[.252,.06],[.244,.08],[.2,.092],[.09,.104],[-.2,.106],[-.243,.086],[-.252,.06]]),Hc=Bc([[.095,.1],[.022,.152],[-.05,.158],[-.12,.144],[-.205,.1]]),Uc=Bc([[.03,.15],[-.05,.162],[-.122,.148],[-.212,.101],[-.15,.1],[-.11,.132],[-.05,.146],[.03,.142]]);function Wc(e,t=q.red){return e.footprint(`prop`,()=>{if(X(e,`car/sedan-sports.glb`,0,0,0,.2,Math.PI/2))return;let n=.2;e.add(ht(Vc,n,.012),t),e.add(ht(Hc,n*.74,.01),`#1d2c3c`,void 0,`glass`),e.add(ht(Uc,n*.78,.008),t);for(let n of[-1,1])e.add(F(),t,G(.16,.085,n*.07,[.085,.038,.04])),e.add(F(),t,G(-.15,.09,n*.078,[.1,.045,.036])),e.add(F(),`#fff6d2`,G(.232,.092,n*.066,[.014,.02,.022]),`glass`);e.add(z(.006,.014,n*.8,.003),`#9b1016`,G(-.257,.082,0),`glass`),e.add(z(.04,.008,n*.82,.003),t,G(-.235,.104,0,1,[0,0,.25])),e.add(z(.008,.016,n*.55,.004),q.black,G(.258,.05,0)),zc(e,[.16,-.155],.10200000000000001,.042,.032)})}function Gc(e,t=q.red){return e.footprint(`prop`,()=>{if(X(e,`car/suv.glb`,0,0,0,.26,Math.PI/2))return;let n=.46;e.add(z(n,.11,.22,.03),t,G(0,.1,0)),e.add(z(n*.62,.085,.2,.025),t,G(-.0368,.19,0)),e.add(z(n*.58,.06,.205,.02),`#1d2c3c`,G(-.0368,.19,0),`glass`),e.add(z(n*.66,.012,.18,.004),q.black,G(-.0368,.238,0));for(let t of[-1,1])e.add(F(),`#fff6d2`,G(n*.49,.12,t*.07,.016),`glass`);zc(e,[n*.3,-.138],.1,.05,.04)})}function Kc(e,t=q.red){return e.footprint(`prop`,()=>{let n=.32;e.add(z(n,.07,.13,.016),t,G(0,.065,0)),e.add(z(n*.96,.065,.13,.016),t,G(0,.13,0)),e.add(z(n*.62,.016,.12,.004),q.cream,G(.01,.1,0));for(let t of[.07,.135])for(let n=0;n<4;n++)for(let r of[-1,1])e.add(z(.042,.03,.006,.003),q.windowBlue,G(-.1+n*.065,t,r*.066),`glass`);e.add(z(.012,.045,.07,.004),q.windowBlue,G(.162,.08,0),`glass`),zc(e,[-.09,.09],.068,.028,.018)})}function qc(e,t={}){return e.footprint(`prop`,()=>{let n=.34;e.add(z(n,.09,.15,.02),t.body??q.yellow,G(0,.075,0)),e.add(z(n,.075,.152,.02),t.upper??q.cream,G(0,.155,0)),e.add(z(.35000000000000003,.02,.16,.008),q.white,G(0,.2,0));for(let t=0;t<5;t++){let r=-.34/2+n/5*(t+.5);for(let t of[-1,1])e.add(z(.045,.05,.004,.006),q.windowBlue,G(r,.155,t*.077),`glass`)}for(let t of[-1,1])e.add(z(.004,.05,.1,.006),q.windowBlue,G(t*.171,.155,0),`glass`);e.add(lt(),q.metal,G(0,.25,0,[.008,.1,.008],[0,0,.6])),e.add(z(n*.9,.02,.12,.006),q.black,G(0,.025,0))})}function Jc(e){let t=[new P(.24,0),new P(.12,.075),new P(-.2,.075),new P(-.22,0),new P(-.2,-.075),new P(.12,-.075)];e.add(Vt(t,-.03,.05,.015,.25),q.white),e.add(Vt(t.map(e=>e.clone().multiplyScalar(1.02)),0,.02,.004),q.tealDark),e.add(z(.2,.05,.11,.02),q.cream,G(-.04,.075,0)),e.add(z(.14,.03,.115,.012),`#1d2c3c`,G(-.02,.08,0),`glass`),e.add(z(.12,.035,.09,.015),q.white,G(-.06,.115,0))}var Yc=`#ff5a6e`;function Xc(e){for(let t of[-.012,.012])e.add(B(1,1,8),`#d9445a`,G(0,.07,t,[.004,.14,.004]));e.add(F(),Yc,G(0,.15,0,[.055,.035,.035],[0,0,.25]));for(let t of[-1,1])e.add(F(),`#e8465c`,G(-.012,.158,t*.026,[.04,.022,.012],[0,0,.35]));e.add(F(),`#ff7a8a`,G(-.045,.162,0,[.025,.016,.022]))}function Zc(e){e.add(Rt([new H(0,0,0),new H(.02,.05,0),new H(-.005,.09,0),new H(.015,.12,0)],.007,5),Yc),e.add(F(),Yc,G(.02,.123,0,.016)),e.add(xt(5),q.cream,G(.03,.12,0,[.008,.018,.008],[0,0,-2])),e.add(xt(5),q.black,G(.042,.108,0,[.006,.016,.006],[0,0,-2.6]))}function Qc(e){let t=`#5a341c`;for(let n of[.06,-.06])for(let r of[-.03,.03])e.add(B(.8,1,8),t,G(n,.03,r,[.014,.06,.014]));e.add(F(),`#7a4a2a`,G(-.02,.085,0,[.1,.05,.05])),e.add(F(),t,G(.05,.1,0,[.06,.065,.055]))}function $c(e){e.add(F(),`#4a2a16`,G(.035,-.01,0,[.04,.035,.032]));for(let t of[-1,1])e.add(B(.4,1,4),q.cream,ho(new H(.03,.015,t*.022),new H(.035,.035,t*.04),.006))}function el(e,t,n,r,i=0){return e.footprint(`prop`,()=>{e.group(G(t,n,r,1,[0,i,0]),()=>{for(let t of[.025,-.02])for(let n of[-.016,.016])e.add(B(1,1,6),q.black,G(t,.02,n,[.008,.04,.008]));e.add(F(),q.white,G(0,.06,0,[.046,.034,.032])),e.add(F(),`#f7f7f7`,G(-.016,.078,0,[.03,.024,.026])),e.add(F(),q.white,G(.012,.072,.012,.022)),e.add(F(),q.black,G(.042,.064,0,[.016,.014,.014])),e.add(F(),`#f2c6b0`,G(.05,.06,0,[.008,.006,.008]))})})}var tl=84,nl=1.3,rl=nl*2/tl;function il(e,t,n){for(let r of e){let e=r.attributes.position,i=r.index,a=r.attributes.aTex,o=r.attributes.color,s=i?i.count:e.count;for(let r=0;r<s;r+=3){let s=i?i.getX(r):r,c=i?i.getX(r+1):r+1,l=i?i.getX(r+2):r+2,u=e.getX(s),d=e.getY(s),f=e.getZ(s),p=e.getX(c),m=e.getY(c),h=e.getZ(c),g=e.getX(l),_=e.getY(l),v=e.getZ(l),y=p-u,b=m-d,x=h-f,S=g-u,C=_-d,w=v-f,T=b*w-x*C,E=x*S-y*w,ee=y*C-b*S,D=Math.hypot(T,E,ee);if(D<1e-12)continue;let O=Math.abs(E)/D;if(O<.15)continue;let k=(h-v)*(u-g)+(g-p)*(f-v);if(Math.abs(k)<1e-12)continue;let te=Math.max(0,Math.floor((Math.min(u,p,g)+nl)/rl)),A=Math.min(83,Math.floor((Math.max(u,p,g)+nl)/rl)),ne=Math.max(0,Math.floor((Math.min(f,h,v)+nl)/rl)),re=Math.min(83,Math.floor((Math.max(f,h,v)+nl)/rl));for(let e=te;e<=A;e++){let r=-1.3+(e+.5)*rl;for(let i=ne;i<=re;i++){let c=-1.3+(i+.5)*rl,l=((h-v)*(r-g)+(g-p)*(c-v))/k,y=((v-f)*(r-g)+(u-g)*(c-v))/k,b=1-l-y;if(l<-1e-4||y<-1e-4||b<-1e-4)continue;let x=l*d+y*m+b*_,S=e*tl+i;n?x>t.water[S]&&(t.water[S]=x):x<=t.top[S]||(t.top[S]=x,t.tex[S]=a?Math.round(a.getX(s)):go.plain,t.flat[S]=O,o&&(t.color[S*3]=o.getX(s),t.color[S*3+1]=o.getY(s),t.color[S*3+2]=o.getZ(s)))}}}}}function al(e){let t=e.geometries(`solid`);for(let e=t.length-1;e>=0;e--){let n=t[e],r=n.attributes.position,i=n.index;if(!i||r.count<200)continue;let a=1/0,o=-1/0;for(let e=0;e<r.count;e++){let t=r.getY(e);t<a&&(a=t),t>o&&(o=t)}if(a<.31||o-a<.04)continue;let s=a+.006,c=[];for(let e=0;e<i.count;e+=3){let t=i.getX(e),n=i.getX(e+1),a=i.getX(e+2);r.getY(t)<=s&&r.getY(n)<=s&&r.getY(a)<=s||c.push(t,n,a)}c.length===0?(n.dispose(),t.splice(e,1)):c.length!==i.count&&n.setIndex(c)}}function ol(e,t={}){let n=t.density??1,r={top:new Float32Array(7056).fill(-1/0),tex:new Int8Array(7056).fill(-1),flat:new Float32Array(7056),color:new Float32Array(21168),water:new Float32Array(7056).fill(-1/0)};il(e.geometries(`solid`),r,!1),il(e.geometries(`glass`),r,!1),il(e.geometries(`water`),r,!0);let i=(e,t)=>r.tex[e]===go.ground&&r.flat[e]>.7&&Math.abs(r.top[e]-t)<.04&&r.water[e]<r.top[e]-.003,a=new N,o=new N,s=[`#ff8fb1`,`#ffe066`,`#ffffff`,`#c3a6ff`,`#ff9f5a`],c=t=>t[Math.floor(e.rand()*t.length)],l=(t,n,r,i,a,o)=>{X(e,c(t),n,r-.002,i,a*e.range(.75,1.25),e.rand()*6.28,{footprint:!1})||o()};e.textured(go.plain,()=>{for(let t=1;t<83;t++)for(let u=1;u<83;u++){let d=t*tl+u;if(!i(d,r.top[d])||!i(d-1,r.top[d])||!i(d+1,r.top[d])||!i(d-tl,r.top[d])||!i(d+tl,r.top[d]))continue;let f=e.rand()/n,p=-1.3+(t+.5+(e.rand()-.5)*.6)*rl,m=-1.3+(u+.5+(e.rand()-.5)*.6)*rl,h=r.top[d]-(1-r.flat[d])*.03,[g,_,v]=[r.color[d*3],r.color[d*3+1],r.color[d*3+2]];a.setRGB(g,_,v);let y=Math.min(g,_,v)>.7,b=!y&&_>g&&_>v,x=!y&&!b&&g>_&&_>v&&v<g*.6,S=Math.sin(p*9.1+m*3.7)*Math.sin(m*8.3-p*2.9);if(b){let t=S>.3?.05:.008,n=S<-.6?.006:0;f<t?l(sl,p,h,m,.04,()=>fl(e,p,h,m,c(s))):f<t+n?l(cl,p,h,m,.03,()=>{}):f<t+n+.003&&l(ll,p,h,m,.02,()=>pl(e,p,h,m,o.copy(a).multiplyScalar(.7)))}else x?f<.012?l(dl,p,h,m,.022,()=>pl(e,p,h,m,o.copy(a).multiplyScalar(e.range(.55,.75)))):f<.016&&pl(e,p,h,m,`#fff3e0`,.6):y?f<.006&&l(ul,p,h,m,.025,()=>pl(e,p,h,m,`#8a8f99`)):f<.008&&l(ll,p,h,m,.02,()=>pl(e,p,h,m,o.copy(a).multiplyScalar(.7)))}})}var sl=[`nature/flower_purpleA.glb`,`nature/flower_purpleB.glb`,`nature/flower_redA.glb`,`nature/flower_redB.glb`,`nature/flower_yellowA.glb`,`nature/flower_yellowB.glb`,`nature/flower_yellowC.glb`],cl=[`nature/mushroom_red.glb`,`nature/mushroom_redGroup.glb`,`nature/mushroom_tan.glb`,`nature/mushroom_tanGroup.glb`],ll=[`nature/rock_smallA.glb`,`nature/rock_smallB.glb`,`nature/rock_smallC.glb`,`nature/rock_smallE.glb`],ul=[`holiday/rocks-small.glb`,`holiday/rocks-medium.glb`],dl=[`pirate/rocks-sand-a.glb`,`pirate/rocks-sand-b.glb`,`survival/rock-sand-a.glb`];function fl(e,t,n,r,i){e.add(xt(3),`#4f8f3a`,G(t,n-.002,r,[.003,.03,.003])),e.add(Re(0),i,G(t,n+.03,r,.009))}function pl(e,t,n,r,i,a=1){let o=e.range(.01,.022)*a;e.add(je(),i,G(t,n+o*.15,r,[o,o*.55,o*.85],[0,e.rand()*6,0]))}var ml=.012,hl=.02;function gl(e){let t=e.footprints,n=t.filter(e=>e.kind===`prop`);for(let r=0;r<12;r++){let r=!1;for(let i of n){let n=0,a=0;for(let e of t){if(e===i)continue;let t=_l(i,e);if(!t)continue;let r=e.kind===`prop`?.5:1;n+=t.x*r,a+=t.z*r}let o=Math.hypot(n,a);if(o<1e-4)continue;let s=.07;o>s&&(n*=s/o,a*=s/o);let c=(i.minX+i.maxX)/2+n,l=(i.minZ+i.maxZ)/2+a;if(e.shore){let t=Math.min(.05,(i.maxX-i.minX)*.2),r=as(e.shore,new H(c,0,l),t);n+=r.x-c,a+=r.z-l}Math.hypot(n,a)<1e-4||(vl(i,n,a),r=!0)}if(!r)break}}function _l(e,t){let n=t.kind===`structure`?hl:ml,r=Math.min(e.maxX,t.maxX)-Math.max(e.minX,t.minX),i=Math.min(e.maxZ,t.maxZ)-Math.max(e.minZ,t.minZ);if(r<=-n||i<=-n)return null;let a=r+n,o=i+n,s=(e.minX+e.maxX)/2,c=(t.minX+t.maxX)/2,l=(e.minZ+e.maxZ)/2,u=(t.minZ+t.maxZ)/2;return a<o?{x:(s===c?1:Math.sign(s-c))*a,z:0}:{x:0,z:(l===u?1:Math.sign(l-u))*o}}function vl(e,t,n){for(let r of e.geos)r.translate(t,0,n);for(let r of e.parts)r.matrix.elements[12]+=t,r.matrix.elements[14]+=n;e.minX+=t,e.maxX+=t,e.minZ+=n,e.maxZ+=n}var yl=(e,t)=>t[Math.floor(e.rand()*t.length)];function bl(e,t,n,r,i=`nature/fence_simple.glb`){let a=gs(i);if(!a)return;let o=Math.max(a.halfX,a.halfZ)*2*r,s=a.halfX>=a.halfZ,c=n.clone().sub(t),l=Math.hypot(c.x,c.z),u=Math.max(1,Math.round(l/o)),d=l/(u*o),f=-Math.atan2(c.z,c.x)+(s?0:Math.PI/2);for(let a=0;a<u;a++){let o=(a+.5)/u,c=t.clone().lerp(n,o),l=s?[d,1,1]:[1,1,d];X(e,i,c.x,c.y,c.z,r,f,{footprint:!1,stretch:l})}}function xl(e,t,n,r,i=[]){for(let a=0;a<t.length;a++)i.includes(a)||bl(e,t[a],t[(a+1)%t.length],n,r)}function Sl(e,t,n,r,i,a,o,s){for(let c=0;c<o;c++){let o=e.range(0,Math.PI*2),c=(s.inner??0)+Math.sqrt(e.rand())*(a-(s.inner??0));X(e,yl(e,t),n+Math.cos(o)*c,r,i+Math.sin(o)*c,e.range(s.h[0],s.h[1]),e.range(0,6.28),{footprint:s.footprint??!1})}}function Cl(e,t,n,r,i,a=0){let o=r/2;for(let s=0;s<n.length-1;s++){let c=n[s],l=n[s+1],u=c.distanceTo(l);for(;o<=u;){let n=c.clone().lerp(l,o/u);X(e,t,n.x,n.y,n.z,i,a,{footprint:!1}),o+=r}o-=u}}function wl(e,t,n,r,i={}){let a=i.unit??.14,o=i.w??2,s=i.d??2,c=i.snow??!1,l=c?`holiday/cabin-roof-snow.glb`:`holiday/cabin-roof.glb`,u=c?`holiday/cabin-roof-snow-chimney.glb`:`holiday/cabin-roof-chimney.glb`,d=[`holiday/cabin-window-a.glb`,`holiday/cabin-window-b.glb`,`holiday/cabin-window-c.glb`],f=(t,n,r,i,a,o=!1)=>X(e,t,n,r,i,1,a,{native:!0,footprint:!1,stretch:o?[-1,1,1]:void 0}),p=new H;e.footprint(`structure`,()=>{e.group(G(t,n,r,a,[0,i.ry??0,0]),()=>{let e=e=>e-(o-1)/2,t=e=>e-(s-1)/2,n=Math.floor((o-1)/2);for(let r=0;r<o;r++)f(r===n?`holiday/cabin-doorway.glb`:d[r%d.length],e(r),0,t(s-1),0),f(r%2?`holiday/cabin-wall.glb`:d[(r+1)%d.length],e(r),0,t(0),Math.PI);for(let n=0;n<s;n++)f(n%2?d[2]:`holiday/cabin-wall.glb`,e(o-1),0,t(n),Math.PI/2),f(n%2?`holiday/cabin-wall.glb`:d[0],e(0),0,t(n),-Math.PI/2);f(`holiday/cabin-corner.glb`,e(0),0,t(s-1),0),f(`holiday/cabin-corner.glb`,e(o-1),0,t(s-1),Math.PI/2),f(`holiday/cabin-corner.glb`,e(o-1),0,t(0),Math.PI),f(`holiday/cabin-corner.glb`,e(0),0,t(0),-Math.PI/2);for(let n=0;n<s;n++)for(let r=0;r<o;r++){let a=e(r)>0,s=i.chimney!==!1&&n===0&&r===o-1?u:l;f(s,e(r),1,t(n),a?0:Math.PI)}for(let n=0;n<o;n++){let r=e(n)>0;f(`holiday/cabin-wall-roof.glb`,e(n),1,t(s-1),0,!r),f(`holiday/cabin-wall-roof.glb`,e(n),1,t(0),Math.PI,r)}})});let m=G(t,n,r,a,[0,i.ry??0,0]);return p.set((o-1)/2+.2,2.1,-(s-1)/2).applyMatrix4(m),p}var Tl=[`#2f6fd6`,`#ffffff`,`#e0352b`,`#2fa84f`,`#f5c518`];function El(e,t,n,r={}){let i=r.post??.22,a=r.sag??.06,o=r.flag??.03,s=[...r.tiedA?[]:[t],...r.tiedB?[]:[n]];for(let t of s)e.add(B(1,1,6),`#6b4a32`,G(t.x,t.y+i/2,t.z,[.007,i,.007]));let c=r.tiedA?t.clone():t.clone().add(new H(0,i-.01,0)),l=r.tiedB?n.clone():n.clone().add(new H(0,i-.01,0)),u=e=>c.clone().lerp(l,e).add(new H(0,-Math.sin(Math.PI*e)*a,0)),d=Math.hypot(n.x-t.x,n.z-t.z),f=-Math.atan2(n.z-t.z,n.x-t.x);for(let t=0;t<12;t++){let n=u(t/12),r=u((t+1)/12);e.add(B(1,1,4),`#d8cfc0`,ho(n,r,.0025))}let p=Math.max(3,Math.floor(d/(o*1.25)));for(let t=1;t<p;t++){let n=u(t/p),i=r.colors??Tl;e.add(lt(),i[t%i.length],G(n.x,n.y-o*.55,n.z,[o,o*1.05,.002],[0,f,(e.rand()-.5)*.25]))}}function Dl(e,t,n,r,i,a,o=0,s=1,c=`structure`){let l=gs(t);if(!l)return 0;let u=a/(2*Math.max(l.halfX,l.halfZ));return X(e,t,n,r,i,u,o,{stretch:s===1?void 0:[1,s,1],footprint:c}),u*s}function Ol(e,t,n,r){let i=new T(t,!0,`centripetal`),a=i.getLength(),o=r.speed??.25,s=r.gap??.006;e.part(()=>{let e=new Le,t=[],c=0;for(let i of n){let n=vs(i.file);if(!n)continue;let a=(n.max.z-n.min.z)*r.scale,o=new Le,l=n.object;l.scale.setScalar(r.scale),l.position.set(0,-n.min.y*r.scale,-((n.min.z+n.max.z)/2)*r.scale),i.reversed&&(l.rotation.y=Math.PI,l.position.z*=-1),o.add(l),e.add(o),t.push({object:o,back:c+a/2}),c+=a+s}let l=new H;return{object:e,update(e){let n=e*o/a%1;for(let e of t){let t=n-e.back/a;t-=Math.floor(t),i.getPointAt(t,e.object.position),i.getTangentAt(t,l),e.object.rotation.y=Math.atan2(l.x,l.z)}}}})}var kl=new De({uniforms:{uTime:xa,uNight:Sa},transparent:!0,depthWrite:!1,side:2,blending:2,fog:!1,vertexShader:`
uniform float uTime;
attribute vec2 aCurtain;
varying vec2 vCurtain;
void main() {
  vCurtain = aCurtain;
  vec3 p = position;
  // Slow folds travelling along the curtain, swinging more at the top.
  float fold = sin(aCurtain.x * 9.0 + uTime * 0.35) * 0.05 + sin(aCurtain.x * 23.0 - uTime * 0.6) * 0.02;
  p.z += fold * (0.4 + aCurtain.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,fragmentShader:`
uniform float uTime;
uniform float uNight;
varying vec2 vCurtain;
void main() {
  float u = vCurtain.x;
  float v = vCurtain.y;
  // Vertical rays that drift and flicker.
  float rays = 0.5 + 0.5 * sin(u * 70.0 + uTime * 0.8 + sin(u * 11.0 - uTime * 0.3) * 4.0);
  rays = 0.35 + 0.65 * pow(rays, 2.5);
  float shimmer = 0.75 + 0.25 * sin(uTime * 1.7 + u * 31.0);
  // A bright lower hem fading up into the dark.
  float hem = smoothstep(0.0, 0.08, v) * (1.0 - smoothstep(0.25, 1.0, v));
  float ends = smoothstep(0.0, 0.18, u) * (1.0 - smoothstep(0.82, 1.0, u));
  vec3 green = vec3(0.25, 1.0, 0.55);
  vec3 violet = vec3(0.55, 0.3, 0.95);
  vec3 col = mix(green, violet, smoothstep(0.45, 1.0, v));
  col *= 1.0 + (1.0 - smoothstep(0.0, 0.2, v)) * 0.8;
  float a = rays * shimmer * hem * ends * uNight * 0.75;
  gl_FragColor = vec4(col, a);
}`});function Al(e,t){let n=e.length,r=new Float32Array(n*8*3),i=new Float32Array(n*8*2);for(let a=0;a<n;a++)for(let o=0;o<8;o++){let s=o/7,c=e[a],l=(a*8+o)*3;r[l]=c.x,r[l+1]=c.y+s*t,r[l+2]=c.z-s*t*.25,i[(a*8+o)*2]=a/(n-1),i[(a*8+o)*2+1]=s}let a=[];for(let e=0;e<n-1;e++)for(let t=0;t<7;t++){let n=e*8+t,r=n+8;a.push(n,r,n+1,r,r+1,n+1)}let o=new v;return o.setAttribute(`position`,new xe(r,3)),o.setAttribute(`aCurtain`,new xe(i,2)),o.setIndex(a),o}function jl(e,t,n=.6){let r=(e,n,r,i)=>Array.from({length:40},(a,o)=>{let s=o/39,c=(s-.5)*n;return new H(c,t+Math.sin(s*Math.PI)*.06,e+Math.sin(s*Math.PI*1.6+i)*r)});e.part(()=>{let e=new M(Al(r(-.55,2,.22,0),n),kl);return e.add(new M(Al(r(-.8,1.6,.16,1.4),n*.8),kl)),e.renderOrder=10,e.frustumCulled=!1,{object:e,update(){e.visible=Sa.value>.01}}})}var Ml=`#c8102e`;function Nl(e){Y(e),Jo(e,K(-.72,J-.04,-.72),K(.68,J-.04,-.74),5,.2,.36,q.mountainGrey,q.snow),qo(e,-.44,-.5,.4,.78),qo(e,.48,-.56,.36,.66),X(e,`city-suburban/building-type-k.glb`,-.66,J,.1,.24,Math.PI*.95),X(e,`city-suburban/building-type-e.glb`,-.42,J,.18,.26,Math.PI),X(e,`city-suburban/building-type-c.glb`,-.6,J,.4,.22,Math.PI*1.1),X(e,`city-suburban/building-type-a.glb`,-.34,J,.44,.22,Math.PI*.9),Ic(e,K(-.42,J+.56,-.4),K(-.12,J+.2,.06),q.red);let t=zo(Ne(.34,.2),1,.36,.42);Yo(e,t,J,q.lake,{paint:q.sand,width:.07}),Oc(e,.2,J,-.02,{h:.5,w:.1,paint:q.cream,roof:`#3d4a63`});let n=wl(e,.46,J,-.1,{unit:.1,w:2,d:2,ry:-.25});wl(e,.7,J,.1,{unit:.09,w:2,d:1,ry:-.6,chimney:!1}),Oo(e,n,{height:.22,size:.022}),X(e,`pirate/boat-row-small.glb`,.44,J+.006,.38,.04,.4,{footprint:!1}),cc(e,(e,n)=>Ho(t,e,n),K(.3,J+.022,.78),K(.34,J+.022,.42),.16,{width:.07,floor:J-.03});let r=[K(0,J+.004,.9),K(-.06,J+.004,.5),K(-.12,J+.004,.14)];rs(e,r,.07,`#cdb994`),Cl(e,`fantasy-town/lantern.glb`,r.map(e=>e.clone().add(K(.07,0,0))),.2,.13),Do(e,.04,J,.3,{poleHeight:.24,width:.12,height:.08,stripes:[Ml,`#f4f6fa`,Ml],horizontal:!0,pole:q.woodDark}),Ms(e,-.78,J,-.12,.36),Ms(e,0,J,-.28,.3),Ms(e,.76,J,-.2,.32),Sl(e,[`nature/tree_pineRoundA.glb`,`nature/tree_pineRoundC.glb`,`nature/tree_pineTallA.glb`],-.2,J,-.18,.1,3,{h:[.16,.26]}),Sl(e,[`nature/tree_pineRoundA.glb`,`nature/tree_pineTallB.glb`],.72,J,.42,.1,3,{h:[.14,.24]}),Ms(e,-.68,J,.62,.26)}function Pl(e){Y(e);let t=[K(-.95,J+.006,.32),K(.05,J+.006,.4),K(.95,J+.006,.26)];ts(e,t,.22,q.river,1,`#9b8f86`),Sc(e,t,bo.model(e=>e.group(G(0,0,0,.32),()=>Jc(e)),`amsterdam-boat`),{speed:.05}),X(e,`nature/bridge_woodRound.glb`,-.32,J-.01,.36,.11,Math.PI/2+.08,{stretch:[1,1,1.15]}),X(e,`city-suburban/building-type-k.glb`,-.6,J,-.08,.36,Math.PI),X(e,`city-suburban/building-type-e.glb`,-.3,J,-.1,.38,Math.PI),X(e,`city-suburban/building-type-b.glb`,.36,J,-.08,.3,Math.PI),X(e,`car/sedan.glb`,.14,J,.1,.075,1.4,{footprint:!1});let n=[K(-.95,J+.004,.11),K(.05,J+.004,.16),K(.95,J+.004,.05)];rs(e,n,.09,q.cobble),Cl(e,`fantasy-town/lantern.glb`,n.map(e=>e.clone().add(K(0,-.004,.065))),.28,.12),X(e,`city-suburban/planter.glb`,-.12,J,.03,.035,0,{footprint:!1}),X(e,`city-suburban/planter.glb`,.48,J,0,.035,0,{footprint:!1}),rs(e,[K(-.31,J+.004,.5),K(-.26,J+.004,.7),K(-.3,J+.004,.95)],.07,`#c8a878`);let r=[`nature/flower_redA.glb`,`nature/flower_yellowA.glb`,`nature/flower_purpleA.glb`,`nature/flower_redB.glb`];for(let t=0;t<4;t++)for(let n=0;n<10;n++){let i=.12+n*.05+e.range(-.006,.006),a=.6+t*.06;Math.hypot(i,a)>.86||X(e,r[t],i,J,a,.045,e.rand()*6,{footprint:!1})}let i=.02,a=-.36,o=1.5;e.footprint(`structure`,()=>{e.add(B(.72,1,8),`#7a5a43`,G(i,J+.18*o,a,[.1*o,.36*o,.1*o])),e.add(B(1,1,8),`#f1e6d0`,G(i,J+.03*o,a,[.11*o,.06*o,.11*o])),e.add(xt(8),`#4a5560`,G(i,J+.4*o,a,[.09*o,.1*o,.09*o]))}),e.part(()=>{let e=new Le,t=_s(`fantasy-town/windmill.glb`);return t&&(t.position.y=-.5,e.add(t)),{object:e,update:t=>e.rotation.x=t*.6}},G(i,J+.36*o,-.20999999999999996,.36*o,[0,Math.PI/2,0])),Z(e,-.58,J,-.46,.4),Z(e,.7,J,-.2,.36,q.foliageDark),Q(e,-.52,J,.62,.06),Sl(e,[`nature/plant_bushSmall.glb`,`nature/flower_redA.glb`,`nature/flower_yellowB.glb`],-.2,J,.7,.12,5,{h:[.03,.05]})}function Fl(e){Y(e);let t=`#f2d27a`;Zs(e,-.18,J,-.22,{w:.3,h:.78,paint:t,crenellated:!0,windows:{rows:2,cols:1,paint:q.windowBlue,fill:[.3,.45],rounded:!0,band:[.5,.9]}});let n=.24;Qs(e,K(-.5,J,.18),K(.4,J,.18),n,t,.08),Qs(e,K(-.5,J,-.35),K(-.5,J,.18),n,t,.08),Qs(e,K(.4,J,-.1),K(.4,J,.18),n,t,.08),$(e,-.05,J,.2,{w:.2,h:.3,d:.12,paint:t,roof:{kind:`none`},door:q.woodDark}),e.group(G(-.05,J,.2),()=>Xs(e,.22,.14,.3,t)),$(e,.28,J,-.2,{w:.32,h:.34,d:.28,paint:t,windows:{rows:1,cols:2,paint:q.windowBlue,rounded:!0,band:[.5,.9]},roof:{kind:`gableX`,paint:q.terracotta,height:.16},door:!1}),Do(e,-.18,J+.83,-.22,{poleHeight:.3,width:.16,height:.1,stripes:[`#2f4fb5`,`#ffffff`,`#e23a3a`]}),Ps(e,-.7,J,-.05,.5,q.foliage),Q(e,-.55,J,.42,.1),Q(e,.62,J,.32,.07,q.foliageDark)}function Il(e){Y(e);let t=[K(-.95,J+.006,.38),K(.1,J+.006,.46),K(.95,J+.006,.32)];ts(e,t,.24,q.river),Sc(e,t,bo.model(wc,`bangkok-longtail`),{speed:.09}),rs(e,[K(-.95,J+.004,.17),K(.1,J+.004,.24),K(.95,J+.004,.1)],.07,`#d8c39a`),lc(e,K(-.02,J+.02,.24),K(-.01,J+.02,.36),.06,q.wood,J-.03),Mc(e,-.12,J,-.08,.72),Mc(e,-.38,J,.02,.48),Mc(e,.16,J,-.16,.55),Mc(e,.34,J,.05,.4),js(e,-.68,J,.05,{height:.52,lean:2.6,leanAmount:.2}),js(e,.62,J,-.12,{height:.46,lean:-.5,leanAmount:.18}),js(e,.52,J,.18,{height:.4,lean:.3,leanAmount:.15})}function Ll(e,t){Y(e,t?{top:q.snow,side:q.sand,sideDark:q.sandDark}:{top:q.grass,side:q.dirt,sideDark:q.dirtDark}),Jo(e,K(-.55,J-.04,-.72),K(.55,J-.04,-.7),3,.34,.6,t?`#b9c4cf`:q.mountainGrey,t?q.snow:void 0);for(let n=0;n<9;n++){let r=Math.PI+.15+n/8*(Math.PI-.3),i=.72+n%2*.1;Ms(e,Math.cos(r)*i,J,Math.sin(r)*i*.85,e.range(.36,.5),t)}Ms(e,.78,J,0,.4,t),Oo(e,$s(e,-.32,J,-.22,{w:.36,d:.26,h:.18,snow:t}),{count:6,height:.4,size:.035}),Vo(e,.2,-.25,.18,.06,.12,t?q.snow:q.grassDark);let n=zo(Dt(e.rand,.42,.07,36,[1.2,.68]),1,.25,.4);Yo(e,n,J,t?`#7fd6ef`:q.water,{paint:t?`#e1eef5`:q.sand,width:.08}),cc(e,(e,t)=>Ho(n,e,t),K(.12,J+.024,.1),K(.3,J+.024,.45),.24,{floor:J-.03}),rs(e,[K(-.34,J+.004,-.06),K(-.26,J+.004,.12),K(-.12,J+.004,.2),K(.08,J+.004,.2),K(.12,J+.004,.12)],.06,t?`#d3dbe5`:`#b89c6e`,{reach:0}),fc(e,-.08,J,.08),No(e,-.08,J+.02,.08),dc(e,-.2,J,.02,.9),dc(e,.04,J,0,-.9),X(e,`nature/canoe.glb`,.52,J,.18,.07,.6),t&&X(e,`holiday/snowman.glb`,-.58,J,.22,.26,.4)}function Rl(e,t){Ll(e,t?.snow??!0)}function zl(e,t){Ll(e,t?.snow??!1)}function Bl(e){Y(e);let t=q.cream;$(e,-.12,J,-.18,{w:.62,h:.36,d:.26,paint:t,windows:{rows:3,cols:5,paint:q.windowBlue,fill:[.4,.58],rounded:!0},roof:{kind:`gableX`,paint:`#4a5568`,height:.12},door:!1,trim:q.white}),Nc(e,-.12,J+.48,-.18,.48,5,.14,t),Oc(e,-.12,J,-.32,{h:.98,w:.14,paint:t,roof:`#4a5568`});let n=[K(-.75,J+.004,.5),K(.1,J+.004,.42),K(.8,J+.004,.55)];rs(e,n,.18,q.cobble);let r=new T(n).getSpacedPoints(30);mc(e,r),Sc(e,r,bo.model(e=>qc(e,{body:`#2c5aa0`,upper:`#eef0f2`}),`brussels-tram`),{from:.12,to:.88,speed:.08,y:J+.012}),jo(e,.48,J,.12,.15),rc(e,.48,J+.07,.12,.12,q.rock),Z(e,.62,J,-.28,.48),Z(e,.38,J,-.42,.36,q.foliageDark),Q(e,-.62,J,.12,.07)}function Vl(e){Y(e,{top:q.sand,side:q.sandDark,sideDark:q.dirtDark}),rs(e,[K(-.66,J+.004,.4),K(-.2,J+.004,.6),K(.3,J+.004,.52),K(.64,J+.004,.4)],.15,q.sandLight);let t=`#f4dc8c`,n=`#3f8f5a`,r=`#f3e2a6`;e.group(G(0,J,.06,1.22),()=>{$(e,-.42,0,-.12,{w:.42,h:.3,d:.3,paint:t,windows:{rows:2,cols:3,paint:n,rounded:!0},roof:{kind:`hip`,paint:q.terracotta,height:.08},door:n,trim:q.cream}),Zs(e,-.42,.3,-.12,{w:.14,h:.2,paint:t,windows:{rows:1,cols:1,paint:n,rounded:!0}}),e.add(wt(),q.terracotta,G(-.42,.5,-.12,[.08,.11,.08])),e.add(F(`low`),q.terracotta,G(-.42,.63,-.12,.02)),ec(e,0,0,-.02,1.05,.13,`#f1e2b4`),$(e,.2,0,-.18,{w:.16,h:.36,d:.26,paint:r,windows:{rows:3,cols:1,paint:n},roof:{kind:`hip`,paint:`#5fa87a`,height:.08},door:!1}),$(e,.42,0,-.24,{w:.28,h:.48,d:.3,paint:r,windows:{rows:4,cols:2,paint:n},roof:{kind:`flat`,paint:q.cream},door:n,trim:q.cream}),Zs(e,.42,.5,-.24,{w:.14,h:.14,paint:r,windows:{rows:1,cols:1,paint:n,rounded:!0}}),e.add(wt(),`#5fa87a`,G(.42,.64,-.24,[.075,.09,.075])),e.add(F(`low`),`#5fa87a`,G(.42,.75,-.24,.02))}),Z(e,.78,J,.1,.6)}function Hl(e){let t=.38;Y(e,{radius:.95,top:q.sand,side:q.sandDark,topY:.2}),Bo(e,zo(Dt(e.rand,.72,.06),1,-.05,-.22),.15000000000000002,t),Zs(e,-.1,t,-.36,{w:.24,h:.78,paint:q.ochre,roof:{kind:`hip`,paint:q.terracotta,height:.3,overhang:.02},windows:{rows:1,cols:1,paint:q.windowBlue,band:[.25,.5],rounded:!0}}),e.add(B(1,1,16),q.cream,G(-.1,1.02,-.24+.006,[.07,.01,.07],[Math.PI/2,0,0])),e.add(B(1,1,16),q.ochreDark,G(-.1,1.02,-.236,[.08,.008,.08],[Math.PI/2,0,0])),e.add(lt(),q.black,G(-.1,1.0350000000000001,-.22699999999999998,[.006,.04,.004])),e.add(lt(),q.black,G(-.09,1.02,-.22699999999999998,[.03,.006,.004])),Zs(e,.2,t,-.48,{w:.2,h:.62,paint:q.ochre,roof:{kind:`hip`,paint:q.terracotta,height:.12,overhang:.02},windows:{rows:1,cols:1,paint:q.windowBlue,band:[.6,.85],rounded:!0}}),$(e,.24,t,-.14,{w:.36,h:.3,d:.28,paint:q.ochre,windows:{rows:1,cols:2,paint:q.windowBlue},roof:{kind:`hip`,paint:q.terracotta,height:.14,overhang:.025},door:q.tealDark}),Q(e,-.02,t,-.06,.12,q.foliageDark),Q(e,.46,t,-.36,.13,q.foliageDark),Q(e,.08,t,-.6,.12),Q(e,-.3,t,-.12,.09),Q(e,.5,t,-.05,.08),js(e,-.5,t,-.3,{height:.75,lean:Math.PI+.2,leanAmount:.2}),js(e,-.62,t,0,{height:.55,lean:Math.PI-.4,leanAmount:.28}),Do(e,.55,t,.02,{poleHeight:.42,width:.14,height:.1,stripes:[`#ffd23f`],pole:q.ochre}),Fo(e,bo.model(Jc,`cannes-yacht`),.45,0,1.12,{ry:-.25,amp:.004,roll:.02,s:1.8,sea:!0})}function Ul(e){Y(e),Go(e,-.2,-.52,.55,.4,q.foliageDark),Go(e,.32,-.46,.4,.3,q.foliage),jc(e,.02,J,.08,.62),js(e,-.62,J,.18,{height:.55,lean:2.4,leanAmount:.2}),js(e,.62,J,.22,{height:.5,lean:-.4,leanAmount:.2}),Z(e,-.42,J,.48,.34,q.foliage),Z(e,.4,J,.5,.3,q.foliageDark)}function Wl(e){Y(e,{top:q.sand,side:q.sandDark,sideDark:q.dirtDark});let t=`#f0bd50`,n=`#c98a2e`;Wo(e,.3,-.5,{length:1.1,width:.62,height:.62,ry:-.25,paint:t,shade:n}),Wo(e,-.35,-.42,{length:1,width:.56,height:.46,ry:.3,shade:n}),Wo(e,-.66,.06,{length:.6,width:.36,height:.26,ry:1.15,paint:t,shade:n}),Wo(e,.7,-.02,{length:.6,width:.36,height:.3,ry:-1.2,shade:n}),Yo(e,zo(Dt(e.rand,.34,.12,28,[1.3,.6]),1,-.05,.28),J,`#3fc4ab`,{paint:q.sandLight,width:.12});let r=J+.012;ts(e,[K(.12,r,.4),K(.22,r,.62),K(.32,r,.88)],.14,`#3fc4ab`,.6,q.sandLight,`tail`),Lo(e,-.15,1.3,.4)}function Gl(e){Y(e);let t={rows:2,cols:3,paint:q.trunkDark,fill:[.45,.7],rounded:!0};Zs(e,-.42,J,-.28,{w:.28,h:.78,paint:q.stucco,crenellated:!0,windows:{rows:3,cols:2,paint:q.trunkDark,fill:[.3,.5],rounded:!0}}),$(e,0,J,-.25,{w:.5,h:.36,d:.32,paint:q.stucco,windows:t,roof:{kind:`gableX`,paint:q.terracotta,height:.14},door:!1}),Zs(e,.32,J,-.34,{w:.24,h:.55,paint:q.stucco,roof:{kind:`hip`,paint:q.terracotta,height:.16},windows:{rows:2,cols:1,paint:q.trunkDark,fill:[.35,.5],rounded:!0}}),$(e,.42,J,-.08,{w:.26,h:.3,d:.24,paint:q.stucco,windows:{rows:1,cols:2,paint:q.trunkDark,rounded:!0},roof:{kind:`gable`,paint:q.terracotta,height:.12},door:!1}),$(e,.08,J,.04,{w:.3,h:.24,d:.2,paint:q.stucco,windows:{rows:1,cols:2,paint:q.trunkDark,rounded:!0,skipGround:!1,band:[.45,.9]},roof:{kind:`gable`,paint:q.terracotta,height:.12},door:q.trunkDark}),$(e,-.3,J,.32,{w:.15,h:.12,d:.15,paint:q.stucco,roof:{kind:`flat`,paint:q.terracotta},door:!1}),pc(e,.36,J,.36,-.3),Z(e,.66,J,.1,.5),Z(e,-.7,J,-.1,.42,q.foliageDark),Ps(e,-.5,J,.18,.42),Q(e,-.68,J,.28,.09),Q(e,-.55,J,.52,.06),zs(e,.12,J,.42,.14),zs(e,.62,J,.4,.12,q.foliage),zs(e,-.1,J,.5,.1,`#e8642c`)}function Kl(e){Y(e,{top:q.cobble,side:q.dirt,sideDark:q.dirtDark}),Go(e,0,-.58,.7,.5,q.foliageDark);let t=[K(-.95,J+.006,.58),K(.15,J+.006,.64),K(.95,J+.006,.52)];ts(e,t,.26,q.waterDeep),Sc(e,t,bo.model(e=>e.group(G(0,0,0,.75),()=>Cc(e)),`hk-junk`),{speed:.06}),Dl(e,`city-commercial/building-skyscraper-c.glb`,-.39,J,-.2,.17,0,1.35),Dl(e,`city-commercial/building-skyscraper-d.glb`,-.13,J,-.22,.17,Math.PI/2,1.25),Dl(e,`city-commercial/building-skyscraper-b.glb`,.13,J,-.22,.17,0,1.45),Dl(e,`city-commercial/building-skyscraper-a.glb`,.39,J,-.2,.17,Math.PI/2,1.3),Dl(e,`city-commercial/building-skyscraper-a.glb`,-.5,J,.06,.19),Dl(e,`city-commercial/building-skyscraper-b.glb`,-.26,J,.06,.19,Math.PI/2),Dl(e,`city-commercial/building-skyscraper-e.glb`,0,J,.05,.22,0,1.1),Dl(e,`city-commercial/building-skyscraper-c.glb`,.26,J,.06,.19,Math.PI/2),Dl(e,`city-commercial/building-skyscraper-d.glb`,.5,J,.06,.19),Dl(e,`city-commercial/building-e.glb`,-.34,J,.32,.14),Dl(e,`city-commercial/building-c.glb`,.1,J,.32,.14),X(e,`car/taxi.glb`,.42,J,.36,.05,1.4,{footprint:!1}),X(e,`car/sedan.glb`,-.12,J,.38,.05,-1.6,{footprint:!1})}function ql(e){let t=.2,n=.38;Y(e,{radius:1,top:q.sand,side:q.sandDark,sideDark:q.dirtDark,topY:t}),Bo(e,zo(Dt(e.rand,.6,.08),1,.2,-.25),.15000000000000002,n),Ko(e,.3,-.55,.36,.75,q.redRock,q.redRockDark,.33),$(e,.05,n,-.25,{w:.2,h:.3,d:.18,paint:q.ochre,windows:{rows:2,cols:1,paint:q.windowBlue},roof:{kind:`hip`,paint:q.roofRed,height:.12},door:q.trunkDark}),$(e,-.12,n,-.12,{w:.14,h:.18,d:.14,paint:q.ochre,roof:{kind:`hip`,paint:q.roofRed,height:.08},door:!1}),$(e,.5,n,-.12,{w:.18,h:.18,d:.16,paint:q.ochre,windows:{rows:1,cols:1,paint:q.windowBlue},roof:{kind:`hip`,paint:q.roofRed,height:.1},door:!1}),$(e,.36,n,.15,{w:.18,h:.16,d:.15,paint:q.ochre,windows:{rows:1,cols:1,paint:q.windowBlue},roof:{kind:`hip`,paint:q.roofRed,height:.09},door:!1}),Z(e,.12,n,.08,.36),js(e,-.45,t,-.35,{height:.75,lean:Math.PI+.4,leanAmount:.2}),js(e,-.68,t,-.02,{height:.55,lean:Math.PI-.3,leanAmount:.3}),Yo(e,zo(Ne(.42,.22),1,-.2,.52),t,`#63dbe2`,{paint:q.sandLight,width:.08});let r=K(.04,.16,0);Io(e,Xc,Zc,r,-.36,t,.5,{ry:.4,s:1.5,dip:1.1}),Io(e,Xc,Zc,r,-.12,t,.6,{ry:-.5,s:1.4,dip:1.1}),Io(e,Xc,Zc,r,.02,t,.44,{ry:2.6,s:1.5,dip:1.1}),Lo(e,1.3,.35,.35)}function Jl(e){Y(e,{top:`#9aa3a0`,side:q.rockDark,sideDark:`#5c6562`}),qo(e,-.02,-.48,.52,.74,q.rockDark,q.snow),Ws(e,K(.02,J+.28,-.32),K(.16,J+.02,-.02),4),e.group(G(.32,J,.28,1,[0,.6,.15]),()=>Us(e,.11)),e.group(G(.16,J,.3,.7),()=>Us(e,.07)),Yo(e,zo(Ne(.26,.16),1,.18,.32),J,q.ice,{paint:q.rock,width:.06}),Mo(e,.28,J,.28,.1),jl(e,J+.5,.8),Z(e,-.62,J,-.12,.4,q.foliage),Z(e,-.46,J,-.32,.48,q.foliageDark),e.group(G(-.22,J,.42,.8,[0,.55,0]),()=>Gc(e,`#5aa8c8`)),el(e,.52,J,.48,2.2),el(e,.66,J,.28,-.4),el(e,-.48,J,.32,1.2),el(e,.12,J,.58,.2)}function Yl(e){Y(e,{top:`#f1dcae`,side:q.ochre,sideDark:q.sandDark}),Is(e,0,J,-.52,.55,15,`#f0d39a`),$(e,-.05,J,-.06,{w:.56,h:.18,d:.3,paint:q.white,windows:{rows:1,cols:4,paint:q.glassBlue,fill:[.86,.75],faces:[`front`,`right`]},roof:{kind:`flat`,paint:q.wood,overhang:.05},door:!1}),e.add(z(.66,.018,.14,.006),q.wood,G(-.02,J+.009,.17)),sc(e,.26,J,.33,.3,.16,q.white),uc(e,-.22,J,.32,.15),uc(e,-.34,J,.32,.15),Rs(e,-.62,J,-.22,.62),Rs(e,.64,J,-.28,.66),Ls(e,-.74,J,.08,.3),Ls(e,.76,J,.12,.26);for(let[t,n,r]of[[-.45,.5,.07],[-.15,.62,.05],[.45,.58,.06],[.62,.36,.05],[-.62,.3,.05],[.3,-.18,.05]])Q(e,t,J,n,r,q.grass);Fs(e,.12,J,.62,.07,`#e9cf9b`),Fs(e,-.3,J,.66,.05,`#e9cf9b`)}function Xl(e){let t=.2,n=.36;Y(e,{radius:1,top:q.sandLight,side:q.sand,sideDark:q.sandDark,topY:t}),Bo(e,zo(Dt(e.rand,.58,.07),1,.25,-.22),.15000000000000002,n),Go(e,-.3,-.55,.46,.85,`#d39257`,void 0,.16),Go(e,-.02,-.6,.34,.55,`#c98a50`,void 0,.16),Go(e,-.52,-.38,.3,.5,`#c47f45`,void 0,.16),Go(e,-.72,-.12,.26,.36,`#d39257`,void 0,.16),Ko(e,-.18,-.32,.16,.22,`#c98a50`,`#b5733d`,t);let r={kind:`hip`,paint:q.roofRed,height:.1};$(e,.02,n,-.12,{w:.2,h:.16,d:.16,paint:q.white,windows:{rows:1,cols:1,paint:q.windowBlue},roof:r,door:q.woodDark}),$(e,.26,n,-.28,{w:.24,h:.28,d:.2,paint:q.white,windows:{rows:2,cols:2,paint:q.windowBlue},roof:{...r,height:.12},door:q.woodDark}),$(e,.42,n,0,{w:.2,h:.16,d:.16,paint:q.white,windows:{rows:1,cols:2,paint:q.windowBlue},roof:r,door:!1}),js(e,.6,n,-.4,{height:.8,lean:-1,leanAmount:.15}),js(e,.7,n,-.12,{height:.6,lean:.3,leanAmount:.25}),Q(e,.55,n,.16,.06),Q(e,.1,n,.12,.05),Ls(e,-.32,t,-.05,.3),Ls(e,-.52,t,.15,.22),Lo(e,.05,1.35,.4)}function Zl(e){let t=-.72,n=Dt(e.rand,.95,.05,56).map(e=>{let n=Math.atan2(e.y,e.x),r=Math.atan2(Math.sin(n-t),Math.cos(n-t)),i=Math.abs(r)<.62?.5*(1+Math.cos(r/.62*Math.PI)):0;return e.clone().multiplyScalar(1-.42*i)}),r=Y(e,{top:q.cobble,side:q.ochre,sideDark:q.sandDark,outline:n}),i=cs(r,-Math.PI/2-.55,.14),a=i.x,o=i.y,s=Uo(e,[{x:a,z:o,sx:.58,sz:.5,h:.34},{x:a+.12,z:o+.42,sx:.5,sz:.48,h:.14}],q.cobble,J,r),c=cs(r,-1.4,.12),l=cs(r,-.05999999999999994,.12);ac(e,K(c.x,0,c.y),K(l.x,0,l.y),{deckY:J+.02,towerH:J+.36,width:.1}),rs(e,[K(c.x,J+.004,c.y),K(c.x-.12,J+.004,c.y+.2),K(a+.24,J+.004,o+.3)],.08,`#b39b78`,{fit:!1}),rs(e,[K(l.x,J+.004,l.y),K(l.x-.22,J+.004,l.y+.1),K(.46,J+.004,.06)],.08,`#b39b78`,{fit:!1});let u=s(a,o)-.01;Zs(e,a,u,o,{w:.26,h:.45,paint:q.stucco,windows:{rows:1,cols:1,paint:q.trunkDark,rounded:!0,band:[.1,.5]}}),e.group(G(a,u,o),()=>{Xs(e,.28,.28,.45,q.stucco),e.add(wt(),q.stucco,G(0,.45,0,[.08,.1,.08]))});let d=[[a+.16,o+.22],[a+.06,o+.5],[-.2,.1],[-.06,.32],[.12,.58],[.32,.74],[.52,.62]],f=[0];for(let e=1;e<d.length;e++)f.push(f[e-1]+Math.hypot(d[e][0]-d[e-1][0],d[e][1]-d[e-1][1]));let p=f[f.length-1]||1,m=s(d[0][0],d[0][1]),h=d.map(([e,t],n)=>{let r=1-f[n]/p,i=r*r*(3-2*r);return K(e,Math.max(J+.006+i*(m-J),s(e,t)+.008),t)}),g=new T(h,!1,`centripetal`).getSpacedPoints(48);e.textured(go.ground,()=>rs(e,g,.11,q.cobbleDark)),mc(e,g),Po(e,bo.model(e=>qc(e),`lisbon-tram`),g.map(e=>e.clone().setY(e.y+.01)),{speed:.07,pingPong:!0,dwell:2});let _={kind:`gable`,paint:q.terracotta,height:.11};$(e,.32,J,.12,{w:.18,h:.24,d:.16,paint:`#7aa6c8`,windows:{rows:2,cols:1,paint:q.windowBlue},roof:_,door:!1}),$(e,.54,J,.22,{w:.18,h:.18,d:.16,paint:`#e8968a`,windows:{rows:1,cols:1,paint:q.windowBlue},roof:_,door:q.woodDark}),$(e,.28,J,.34,{w:.22,h:.2,d:.16,paint:q.cream,windows:{rows:1,cols:2,paint:q.windowBlue},roof:_,door:q.woodDark}),Zs(e,.16,J,.26,{w:.08,h:.34,paint:q.cream,roof:{kind:`hip`,paint:q.terracotta,height:.08}});let v=s(a-.18,o+.55);$(e,a-.18,v,o+.55,{w:.2,h:.2,d:.16,paint:q.ochre,windows:{rows:1,cols:2,paint:q.windowBlue},roof:{kind:`hip`,paint:q.terracotta,height:.1},door:q.woodDark}),Ps(e,a-.28,s(a-.28,o+.08),o+.08,.45),Z(e,.68,J,.42,.38),Q(e,.55,J,.6,.05),Q(e,a+.22,s(a+.22,o+.18),o+.18,.06,q.foliageDark)}function Ql(e){Y(e);let t=[K(-.95,J+.006,.48),K(.15,J+.006,.55),K(.95,J+.006,.42)];ts(e,t,.26,q.river),Sc(e,t,bo.model(e=>e.group(G(0,0,0,.38),()=>Jc(e)),`london-boat`),{speed:.06});let n=[K(-.9,J+.004,.74),K(0,J+.004,.76),K(.9,J+.004,.66)];rs(e,n,.08,`#8d8f94`),Sc(e,n.map(e=>e.clone().setY(J+.006)),bo.model(e=>e.group(G(0,0,0,.5),()=>Kc(e)),`london-bus`),{from:.22,to:.78,speed:.08}),yc(e,-.62,.06,.22,{rim:`#eef2f6`,pods:`capsule`,gondolas:[`#dce9f2`],count:16,speed:.12,frame:`back`,frameColor:`#eef2f6`});let r=`#e0b57a`,i=`#3d4254`;$(e,-.12,J,-.22,{w:.62,h:.38,d:.28,paint:r,windows:{rows:3,cols:5,paint:q.windowBlue,fill:[.38,.55],rounded:!0},roof:{kind:`gableX`,paint:i,height:.12},door:!1,trim:q.cream}),Nc(e,-.12,J+.5,-.22,.5,5,.16,r),Oc(e,.38,J,.02,{h:.95,w:.18,paint:r,roof:i}),Rc(e,.18,J,.32),Z(e,.7,J,-.05,.44),Q(e,.05,J,.18,.06)}function $l(e){Y(e,{stretch:[1.08,.94]});let t=e=>({rows:3,cols:e,paint:q.windowBlue,fill:[.42,.58],faces:[`front`,`right`,`left`]}),n={kind:`hip`,paint:q.blueRoof,height:.1,overhang:.015};for(let r of[-1,1]){$(e,r*.42,J,-.18,{w:.42,h:.4,d:.62,paint:q.white,windows:t(4),roof:n,door:!1,trim:q.cream});let i=r*.6;$(e,i,J,.06,{w:.2,h:.46,d:.2,paint:q.white,windows:{...t(1),faces:[`front`,r<0?`left`:`right`]},roof:{...n,height:.14},door:!1,trim:q.cream}),nc(e,K(i,J+.62,.06),K(i,J+.62,.06),1),nc(e,K(r*.24,J+.42,.13),K(r*.48,J+.42,.13),3)}$(e,0,J,-.16,{w:.46,h:.46,d:.56,paint:q.white,windows:{rows:3,cols:3,paint:q.windowBlue,fill:[.4,.58],faces:[`front`],skipGround:!0},roof:{...n,height:.08},door:!1,trim:q.cream}),e.add(B(1,1,16),q.windowBlue,G(0,J+.07,.125,[.045,.006,.045],[Math.PI/2,0,0]),`glass`),e.add(B(1,1,8),q.cream,G(0,J+.01,.16999999999999998,[.2,.02,.07]));for(let t=0;t<4;t++)e.add(B(1,1,8),q.white,G(-.12+t*.08,J+.17,.18,[.017,.32,.017]));e.add(Ue(),q.white,G(0,J+.35,.16999999999999998,[.34,.09,.11])),e.group(G(0,0,.16999999999999998),()=>Ys(e,.34,.12,J+.33,{kind:`flat`,paint:q.cream})),nc(e,K(0,J+.41,.16999999999999998),K(0,J+.41,.16999999999999998),1),tc(e,0,J+.5,-.19999999999999998,.17,q.blueRoof),rs(e,[K(0,J,.2),K(0,J,.82)],.12,q.sandLight),jo(e,0,J,.5,.13),Q(e,-.5,J,.5,.08),Q(e,-.32,J,.62,.06),Q(e,.5,J,.5,.08),Q(e,.32,J,.62,.06)}function eu(e){Y(e,{side:q.ochre,sideDark:q.sandDark});let t=.4,n=1.2,r=.34,i=-.28,a=-.3;$(e,i,J,a,{w:t,h:n,d:r,paint:q.cream,windows:{rows:10,cols:3,paint:q.windowTeal,fill:[.55,.5],skipGround:!0},roof:{kind:`flat`,paint:q.teal},door:q.windowTeal});for(let t=1;t<10;t++){let r=J+n*(.08+.84*t/10);e.add(z(.43000000000000005,.012,.04,.005),q.teal,G(i,r,-.11999999999999998))}e.add(z(t*.7,.08,r*.7,.015),q.teal,G(i,J+n+.06,a)),e.add(z(t*.4,.05,r*.4,.012),q.cream,G(i,J+n+.12,a)),hc(e,i,J+.13,-.09499999999999997,.16),$(e,.12,J,-.22,{w:.34,h:.42,d:.3,paint:q.cream,windows:{rows:3,cols:2,paint:q.windowTeal},roof:{kind:`flat`,paint:q.teal},door:!1}),js(e,.5,J,-.38,{height:.85,lean:-1.2,leanAmount:.18}),js(e,.68,J,-.05,{height:.62,lean:.2,leanAmount:.25}),js(e,-.72,J,-.05,{height:.55,lean:Math.PI,leanAmount:.3}),Q(e,.3,J,-.02,.07),Q(e,-.62,J,-.45,.07),sc(e,.38,J,.4,.38,.24,q.cream),e.group(G(-.28,J,.42,1.05,[0,-.35,0]),()=>Wc(e,q.red)),Lo(e,1.3,.35,.35)}function tu(e){Y(e,{radius:1});let t=J+.012;Yo(e,zo(Dt(e.rand,.12,.08,20,[1.3,.8]),1,.07,-.6),J,q.river,{paint:q.rock,width:.12}),ts(e,[K(.07,t,-.56),K(.06,t,-.4),K(-.04,t,-.1),K(.02,t,.35),K(-.12,t,.9)],.15,q.river,1.1,void 0,`tail`),ic(e,K(-.16,J+.01,.12),K(.18,J+.01,.1),.12,.05,q.wood);let n=`#c9b48a`;rs(e,[K(-.22,J+.004,-.2),K(-.26,J+.004,0),K(-.18,J+.004,.12)],.05,n,{reach:0}),rs(e,[K(.2,J+.004,.1),K(.32,J+.004,.02),K(.36,J+.004,-.12)],.05,n,{reach:0}),Go(e,-.55,-.48,.3,.62,q.mountainGrey,q.snow),$(e,-.22,J,-.3,{w:.18,h:.12,d:.14,paint:q.log,roof:{kind:`gableX`,paint:q.terracotta,height:.08},door:q.woodDark});for(let[t,n,r]of[[-.5,-.06,.3],[-.24,-.12,-.4],[-.6,.26,.1],[-.3,.22,2.6]])Io(e,Qc,$c,K(.08,.1,0),t,J,n,{ry:r,s:1.1,dip:.55});ko(e,.38,J,-.25,.95),Jo(e,K(.35,J-.04,-.78),K(.85,J-.04,-.42),4,.15,.4,q.mountainGrey,q.snow);let r=.45,i=.38;[[.27,`#f07a2a`],[.22,`#ffc93c`],[.17,`#7cc85a`]].forEach(([t,n],a)=>e.add(ft(zo(Dt(e.rand,t,.07,28,[1.2,.8]),1,r,i),J+.003+a*.002),n)),e.add(me(zo(Dt(e.rand,.12,.06,28,[1.2,.8]),1,r,i),J+.01),`#2f8fd9`,void 0,`water`),Oo(e,K(r,J+.02,i),{count:5,height:.25,size:.04,period:4,spread:.08,steam:!0}),Ps(e,-.84,J,0,.5,q.grass),Ps(e,.2,J,-.55,.42,q.grassDark),Ps(e,.28,J,-.48,.36,q.grass),Ps(e,.86,J,.2,.46,q.grass),Z(e,-.74,J,-.22,.48,q.grass),Z(e,.8,J,-.08,.42,q.grass),Q(e,-.62,J,.42,.08,q.grass),Q(e,-.38,J,-.45,.06),zs(e,-.5,J,.55,.12,q.foliage),zs(e,.12,J,.62,.12,q.foliage),zs(e,.78,J,.45,.1,q.foliage)}function nu(e){Y(e),Vo(e,-.2,-.42,.65,.38,.48,q.foliageDark),e.add(z(.035,.26,.035,.006),q.white,G(-.22,J+.52,-.38)),e.add(z(.14,.035,.035,.006),q.white,G(-.22,J+.6,-.38));for(let[t,n,r]of[[-.62,-.3,.2],[-.5,-.12,.17],[.08,-.5,.18],[-.02,-.66,.2],[-.44,-.62,.22]]){let i=(t+.2)/.65,a=(n+.42)/.48;X(e,`nature/tree_pineRoundC.glb`,t,J-.02+.38*Math.sqrt(Math.max(0,1-i*i-a*a))-.015,n,r,t*7,{footprint:!1})}let t=[K(-.02,J+.004,.92),K(.02,J+.004,.62),K(.16,J+.004,.4),K(.28,J+.004,.32)];rs(e,t,.1,`#c9b79c`),Cl(e,`fantasy-town/lantern.glb`,t.map(e=>e.clone().add(K(-.08,0,0))),.2,.11),X(e,`holiday/bench.glb`,-.14,J,.56,.05,1.3,{footprint:!1}),X(e,`city-suburban/building-type-e.glb`,.34,J,.06,.4,.4),xl(e,[K(.1,J,-.12),K(.64,J,-.12),K(.64,J,.34),K(.1,J,.34)],.06,`nature/fence_planks.glb`,[2]),X(e,`car/hatchback-sports.glb`,.5,J,.5,.09,-.4,{footprint:!1}),Sl(e,[`nature/crop_pumpkin.glb`],.2,J,.24,.05,3,{h:[.025,.035]}),X(e,`nature/log_stack.glb`,.58,J,-.04,.05,1.57,{footprint:!1}),Oc(e,.02,J,-.08,{h:.72,w:.14,paint:q.cream,roof:`#3d4a63`}),X(e,`fantasy-town/stall-red.glb`,-.32,J,.18,.14,.5),X(e,`city-commercial/detail-parasol-a.glb`,-.48,J,.38,.1,0,{footprint:!1}),X(e,`fantasy-town/stall-bench.glb`,-.42,J,.44,.03,.3,{footprint:!1}),Z(e,-.62,J,.24,.4,q.red),Z(e,-.36,J,.62,.32,`#e8642c`),Z(e,.74,J,.12,.36,q.foliage),Z(e,.42,J,.72,.3,q.red),Z(e,-.7,J,-.05,.3,`#e8642c`),Z(e,.72,J,.44,.26,q.red),Q(e,.18,J,.62,.05),Q(e,-.22,J,.76,.04),Sl(e,[`nature/plant_bushSmall.glb`,`nature/plant_bush.glb`],-.55,J,.5,.12,4,{h:[.04,.06]})}function ru(e){Y(e,{top:q.sandLight,side:q.sand,sideDark:q.sandDark}),$(e,0,J,-.32,{w:.62,h:.28,d:.24,paint:q.cream,windows:{rows:3,cols:5,paint:q.windowBlue,rounded:!0},roof:{kind:`flat`,paint:q.rock},door:!1,trim:q.white}),tc(e,0,J+.28,-.32,.14,q.cream),Pc(e,0,J,.18,.58,.48,q.cream),js(e,-.66,J,.05,{height:.52,lean:2.3,leanAmount:.18}),js(e,.66,J,.08,{height:.48,lean:-.5,leanAmount:.18}),js(e,.48,J,.48,{height:.4,lean:.4,leanAmount:.14})}var iu=`#2f74c8`,au=`#f4f6fa`,ou=`#d9ccb0`;function su(e,t,n,r,i,a=0){e.footprint(`structure`,()=>{e.group(G(t,J,n,1,[0,a,0]),()=>{let t=.1;e.add(z(r,t,i,.006),`#f3ead6`,G(0,t/2,0)),e.add(z(r+.004,.012,i+.004,.003),`#8a5a36`,G(0,.094,0)),e.add(z(r*.22,t*.75,.01,.004),`#5a3a22`,G(0,t*.375,i/2+.002));for(let n of[-.34,-.2,.2,.34])e.add(z(r*.08,t*.3,.008,.003),q.windowBlue,G(n*r,t*.58,i/2+.002),`glass`);let n=i*.42;for(let a=0;a<9;a++){let o=-r/2+r/9*(a+.5);e.add(Ue(),a%2?au:iu,G(o,t,0,[i*1.08,n,r/9*1.001],[0,Math.PI/2,0]))}for(let a of[-1,1])e.add(Ue(),au,G(a*r/2,t,0,[i*1.1,n*1.02,.006],[0,Math.PI/2,0]));for(let i of[-.3,0,.3])e.add(B(1,1,5),q.woodDark,G(i*r,t+n+.03,0,[.004,.06,.004])),e.add(lt(),i===0?iu:`#e8b923`,G(i*r+.016,t+n+.05,0,[.03,.018,.002]))})})}function cu(e,t,n,r,i){for(let a=0;a<r;a++)for(let r=0;r<i;r++){let o=t+(r-(i-1)/2)*.17,s=n+a*.1;e.add(z(.13,.008,.035,.003),q.wood,G(o,J+.028,s));for(let t of[-1,1])e.add(z(.004,.026,.026,.001),q.woodDark,G(o+t*.05,J+.013,s)),e.add(z(.12,.006,.014,.002),q.woodDark,G(o,J+.017,s+t*.03));for(let t of[-.04,0,.035])e.add(B(1,1,6),`#f5c542`,G(o+t,J+.04,s+(t>0?.008:-.006),[.005,.016,.005]))}}function lu(e,t,n,r){e.footprint(`prop`,()=>{for(let i=0;i<14;i++)e.add(B(1,1,8),i%2?iu:au,G(t,J+r/14*(i+.5),n,[.011,r/14,.011]));for(let i=0;i<3;i++){let a=J+r*(.45+i*.14);e.add(lt(),q.woodDark,G(t,a,n,[.1,.004,.004],[0,i*.9,0]));for(let r of[-1,1]){let o=i*.9;e.add(z(.024,.02,.003,.002),au,G(t+Math.cos(o)*r*.045,a-.014,n-Math.sin(o)*r*.045,1,[0,o,0]))}}e.add(B(1,1,12),`#3f8a3a`,G(t,J+r*.9,n,[.035,.012,.035])),e.add(xt(8),`#3f8a3a`,G(t,J+r,n,[.018,.05,.018]))})}function uu(e){let t=Y(e);e.add(ft(zo(t,.8),J+.002),ou),Ac(e,-.42,J,-.55,.62,q.cream,`#5a8a6a`),Ac(e,-.2,J,-.6,.62,q.cream,`#5a8a6a`),su(e,-.42,-.1,.42,.24,.12),su(e,.2,-.3,.38,.22,-.08),yc(e,.58,-.08,.26),bc(e,.5,.38,.22),lu(e,-.02,.18,.62),cu(e,-.28,.32,3,2),X(e,`fantasy-town/cart.glb`,.12,J,.56,.07,1.2);for(let[t,n,r]of[[.2,.48,.04],[.24,.53,.038],[.21,.57,.036]])X(e,`pirate/barrel.glb`,t,J,n,r,t*9,{footprint:!1});X(e,`fantasy-town/stall-red.glb`,-.66,J,.28,.14,1);let n={sag:.04,flag:.026,post:.2,colors:[iu,au]};El(e,K(-.62,J,.12),K(-.02,J,.04),n),El(e,K(-.02,J,.04),K(.3,J,.18),n),Cl(e,`fantasy-town/lantern.glb`,[K(-.5,J,.62),K(0,J,.7),K(.42,J,.62)],.22,.11),Do(e,-.18,J,.06,{poleHeight:.24,width:.1,height:.065,stripes:[au,iu],horizontal:!0}),Do(e,.42,J,-.14,{poleHeight:.22,width:.09,height:.06,stripes:[au,iu],horizontal:!0}),Z(e,-.74,J,-.1,.36),Z(e,.74,J,.32,.3),Z(e,-.6,J,.58,.3,q.foliageDark)}function du(e){Y(e,{radius:.72,top:q.grass,side:q.dirt}),Ro(e,bo.model(e=>{let t=`#f4efd2`;for(let[n,r,i]of[[-.34,.14,1.3],[.36,.1,1.2],[0,-.22,1.45]]){for(let a=0;a<7;a++){let o=a/7*6.28,s=.15*i;e.add(F(),a%3?t:`#e6dfbf`,G(n+Math.cos(o)*s,.1*i+a%2*.05,r+Math.sin(o)*s*.7,.13*i))}e.add(F(),t,G(n,.22*i,r,.16*i))}},`cloud`),0,J+.05,.05,.12)}var fu=J-.04,pu=.9;function mu(e){Y(e);let t=(t,n,r,i,a,o)=>{let s=t*pu,c=n*pu,l=i*.78;return Go(e,s,c,r*.85,l,a,o,fu),K(s,fu+l,c)};t(0,.12,1,.42,q.foliageDark),t(-.3,.36,.4,.4,q.foliageDark),t(.2,.36,.4,.38,q.grassDark),t(0,-.25,.8,.6,q.mountainGrey),t(.05,-.42,.62,1.55,q.mountainGrey,q.snow),t(-.48,-.3,.5,1.15,q.mountainGrey,q.snow),t(.55,-.26,.48,1.05,q.mountainGrey,q.snow),t(-.22,.02,.45,.82,q.mountainGrey,q.snow),t(.3,.06,.42,.75,q.mountainGrey,q.snow),t(-.7,.08,.36,.62,q.mountainGrey,q.snow),t(.74,.16,.34,.58,q.mountainGrey,q.snow);let n=t(-.5,.6,.34,.5,q.foliageDark),r=t(-.06,.7,.36,.46,q.grassDark),i=t(.38,.64,.34,.52,q.foliageDark);t(.74,.42,.28,.36,q.grassDark),t(-.84,.32,.26,.34,q.grassDark),El(e,n,r,{tiedA:!0,tiedB:!0,sag:.1,flag:.032}),El(e,r,i,{tiedA:!0,tiedB:!0,sag:.1,flag:.032})}function hu(){let e=new Xe().load(se(`./images/NY.png`));return e.colorSpace=E,e.offset.set(241/430,1-122/430),e.repeat.set(78/430,76/430),e}var gu=[`city-commercial/building-skyscraper-a.glb`,`city-commercial/building-skyscraper-b.glb`,`city-commercial/building-skyscraper-c.glb`,`city-commercial/building-skyscraper-d.glb`],_u=[`city-commercial/building-a.glb`,`city-commercial/building-b.glb`,`city-commercial/building-c.glb`,`city-commercial/building-e.glb`,`city-commercial/building-f.glb`,`city-commercial/building-g.glb`,`city-commercial/building-h.glb`,`city-commercial/building-i.glb`,`city-commercial/building-j.glb`,`city-commercial/building-k.glb`,`city-commercial/building-l.glb`],vu=[{r:.3,w:.12,tall:[1.15,1.45],files:gu},{r:.43,w:.12,tall:[1.5,1.8],files:_u},{r:.56,w:.115,tall:[1,1.25],files:_u}];function yu(e){Y(e,{radius:.68,top:`#4b4e54`,side:`#8e9196`,sideDark:`#6c6f75`,paved:!0}),e.detail=!1,Do(e,-.05,J+(Dl(e,`city-commercial/building-skyscraper-e.glb`,0,.36,0,.3)||1.02),.02,{poleHeight:.5,width:.36,height:.26,texture:hu(),pole:q.ochre}),vu.forEach((t,n)=>{let r=Math.floor(Math.PI*2*t.r/(t.w*1.12)),i=n*.37;for(let n=0;n<r;n++){let a=i+n/r*Math.PI*2,o=Math.cos(a)*t.r,s=Math.sin(a)*t.r;if(e.shore&&is(e.shore,o,s)<t.w*.75)continue;let c=t.files[Math.floor(e.rand()*t.files.length)],l=Math.atan2(Math.cos(a),Math.sin(a));Dl(e,c,o,J,s,t.w,l,e.range(t.tall[0],t.tall[1]),!1)}})}function bu(e){Y(e,{side:q.ochre,sideDark:q.sandDark});let t={kind:`hip`,paint:q.terracotta,height:.12,overhang:.04};$(e,0,J,-.12,{w:.62,h:.22,d:.32,paint:q.cream,windows:{rows:1,cols:3,paint:q.windowBlue,faces:[`front`]},roof:{...t,height:.08},door:!1}),$(e,-.05,J+.22,-.16,{w:.4,h:.18,d:.26,paint:q.cream,windows:{rows:1,cols:2,paint:q.windowBlue},roof:t,door:!1}),e.add(z(.18,.13,.012,.006),q.wood,G(.15,J+.065,.045)),e.add(z(.06,.11,.012,.006),q.woodDark,G(-.16,J+.055,.045)),rs(e,[K(-.16,J+.004,.08),K(-.1,J+.004,.45),K(-.2,J+.004,.92)],.14,`#ece3c8`);let n=.84,r=(e,t)=>Array.from({length:6},(r,i)=>{let a=e+(t-e)*i/5;return K(Math.cos(a)*n,J,Math.sin(a)*n)});oc(e,r(Math.PI*.95,Math.PI*1.35)),oc(e,r(-Math.PI*.35,Math.PI*.05)),js(e,-.55,J,-.48,{height:.8,lean:-2.2,leanAmount:.15}),js(e,.55,J,-.5,{height:.78,lean:-.9,leanAmount:.15}),Z(e,-.72,J,-.1,.4),Z(e,.72,J,-.08,.4);for(let[t,n]of[[-.45,.3],[.35,.3],[.55,.5],[-.6,.5]])Q(e,t,J,n,.06),Bs(e,t+.08,J,n+.08,.12,8)}function xu(e){Y(e),Jo(e,K(-.5,J-.04,-.62),K(.5,J-.04,-.6),3,.36,.92,q.mountainGrey,q.snow),Yo(e,zo(Dt(e.rand,.46,.08,36,[1.25,.72]),1,.08,.04),J,q.lake,{paint:q.sand,width:.05}),Gs(e,K(-.36,J,-.12),K(.2,J,-.4),.12,.27);let t=bo.model(e=>Us(e,.08),`berg`);for(let[n,r,i]of[[.1,0,0],[.36,.14,1.2],[-.12,.2,2.5],[.45,-.12,4]])Fo(e,t,n,J+.008,r,{amp:.006,roll:.03,spin:.04,ry:i});Ms(e,-.7,J,.3,.42),Ms(e,-.56,J,.42,.36),Z(e,.7,J,.42,.4),Q(e,-.35,J,.55,.06);for(let[t,n]of[[-.2,.62],[.1,.66],[.35,.6],[-.45,.3]])Fs(e,t,J,n,.045,q.redRockDark)}var Su=`#f7931a`,Cu=null;function wu(){if(Cu)return Cu;let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`);t.fillStyle=Su,t.beginPath(),t.arc(64,64,64,0,Math.PI*2),t.fill(),t.translate(64,64),t.rotate(.24),t.fillStyle=`#fff`,t.font=`bold 84px Arial, Helvetica, sans-serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(`B`,2,4);for(let e of[-8,8])t.fillRect(e-4,-44,8,14),t.fillRect(e-4,32,8,14);return Cu=new Ce(e),Cu.colorSpace=E,Cu}function Tu(e){Y(e,{top:q.sandLight,side:q.sand,sideDark:q.sandDark});for(let[t,n,r,i]of[[-.55,-.32,.68,2.4],[-.28,-.5,.8,2.8],[.18,-.46,.62,-2.6],[.5,-.32,.72,-.8],[.64,.08,.52,.4],[.52,.42,.58,.2],[-.68,.1,.48,3.1]])js(e,t,J,n,{height:r,lean:i,leanAmount:.18});Z(e,.7,J,-.08,.36,q.foliage),Lc(e,-.28,J,.22),Do(e,-.08,J,.18,{poleHeight:.22,width:.1,height:.06,stripes:[`#0073cf`,`#fff`,`#0073cf`],horizontal:!0});let t=e.shore;cc(e,(e,n)=>!Ho(t,e,n),K(-.05,J+.02,.5),K(-.05,J+.02,1.3),.3,{floor:-.05}),uc(e,-.3,J,.58,.2,q.wood),uc(e,-.4,J,.54,.2,q.wood);let n=.24,r=.13,i=J+.26;e.footprint(`structure`,()=>{e.add(B(1,1,8),q.woodDark,G(n,J+(i-J)/2,.62,[.018,i-J,.018]))}),e.group(G(n,i,.64,1,[-.3,0,0]),()=>{e.add(B(1,1,32),Su,G(0,0,0,[r*1.06,.026,r*1.06],[Math.PI/2,0,0])),e.part(()=>({object:new M(new vt(1,40),new pe({map:wu(),emissiveMap:wu(),emissive:`#ffffff`,emissiveIntensity:.25,roughness:.6}))}),G(0,0,.0135,r))}),X(e,`pirate/barrel.glb`,-.48,J,.3,.05,.3,{footprint:!1}),X(e,`pirate/barrel.glb`,-.44,J,.38,.045,1.1,{footprint:!1}),X(e,`pirate/crate.glb`,-.5,J,.12,.04,.5,{footprint:!1}),X(e,`pirate/crate-bottles.glb`,-.12,J,.34,.04,-.3,{footprint:!1}),X(e,`pirate/chest.glb`,.38,J,.16,.04,-.6,{footprint:!1}),X(e,`pirate/boat-row-small.glb`,.62,J-.005,.32,.05,2.2,{footprint:!1,tilt:[0,.12]}),X(e,`pirate/boat-row-large.glb`,.1,0,1.14,.07,1.4,{footprint:!1}),Sl(e,[`nature/plant_bushLarge.glb`,`nature/plant_bushDetailed.glb`,`nature/plant_bush.glb`],-.35,J,-.32,.32,12,{h:[.04,.08]}),Sl(e,[`nature/plant_bushDetailed.glb`,`nature/plant_bushLarge.glb`],.42,J,-.25,.22,7,{h:[.04,.07]}),Sl(e,[`pirate/rocks-sand-a.glb`,`pirate/rocks-sand-b.glb`,`pirate/rocks-sand-c.glb`],-.62,J,.42,.14,4,{h:[.03,.05]}),X(e,`pirate/flag-pirate-high.glb`,.7,J,-.2,.3,-1.2,{footprint:!1})}function Eu(e){let t=J+.1;Y(e,{top:q.cobble,side:q.dirt,sideDark:q.dirtDark}),Bo(e,zo(Dt(e.rand,.62,.06,40,[1.35,.7]),1,0,-.5),J-.05,t),Jo(e,K(-.45,t-.05,-.62),K(.45,t-.05,-.58),3,.32,.85,q.redRock,q.snow),rc(e,-.55,t,-.2,.2);let n=J+.012;ts(e,[K(-.98,n,-.02),K(-.3,n,.06),K(.3,n,0),K(.98,n,.1)],.16,q.river,.9),ic(e,K(.28,J+.02,-.14),K(.3,J+.02,.18),.12,.08,q.cream),rs(e,[K(.3,J+.004,.2),K(.25,J+.004,.45),K(.22,J+.004,.95)],.08,`#b9a98e`);let r=-.62,i=.32,a=1.15;e.add(B(.72,1,18),q.glassBlue,G(r,J+a/2,i,[.12,a,.12]),`glass`);for(let t=1;t<12;t++)e.add(B(1,1,18),`#2f6aa8`,G(r,J+a*t/12,i,[.121-.034*t/12,.006,.121-.034*t/12]));for(let t=0;t<8;t++){let n=t/8*6.28;e.add(B(1,1,4),`#2f6aa8`,G(r+Math.cos(n)*.075,J+a+.04,i+Math.sin(n)*.075,[.008,.1,.008]))}$(e,-.05,J,.5,{w:.36,h:.22,d:.24,paint:q.stucco,windows:{rows:2,cols:3,paint:q.windowBlue},roof:{kind:`hip`,paint:q.roofRed,height:.1},door:q.woodDark}),$(e,.45,J,.48,{w:.2,h:.2,d:.2,paint:q.yellow,windows:{rows:1,cols:1,paint:q.windowBlue,rounded:!0},roof:{kind:`gable`,paint:q.roofRed,height:.12},door:q.woodDark}),Zs(e,.45,J,.32,{w:.11,h:.42,paint:q.yellow,roof:{kind:`hip`,paint:q.roofRed,height:.1},windows:{rows:1,cols:1,paint:q.windowBlue,rounded:!0,band:[.6,.9]}}),Z(e,.75,J,.34,.36),Ps(e,-.84,J,.12,.4),Z(e,.4,t,-.3,.3)}function Du(e){let t=Y(e,{radius:.98});Vo(e,-.35,-.45,.6,.8,.42),Vo(e,.45,-.52,.45,.48,.32,q.grass),Vo(e,-.05,-.25,.4,.24,.32),Vo(e,-.5,.05,.28,.12,.22,q.grass),Vs(e,0,J+.06,-.2,.68),Vs(e,.2,J+.02,-.14,.5),Yo(e,zo(Ne(.3,.18),1,.22,.2),J,q.water,{paint:q.sand,width:.1});let n=cs(t,Math.PI*.3),r=J+.011;ts(e,[K(.4,r,.3),K(.48,r,.48),K(n.x,r,n.y)],.12,q.water,1.2,void 0,`tail`),Ms(e,-.74,J,.32,.5),Ms(e,-.6,J,.46,.42),Z(e,.66,J,.2,.42,`#c7c63a`);for(let[t,n,r]of[[-.25,.3,.05],[-.1,.5,.04],[.1,.6,.05],[-.4,.62,.035],[.3,-.05,.04]])Fs(e,t,J,n,r,q.redRockDark)}function Ou(e){Y(e),X(e,`city-commercial/building-e.glb`,-.1,J,.12,.4,.2),X(e,`city-commercial/building-c.glb`,-.48,J,-.06,.36,-.4),kc(e,.28,J,-.28,.9,q.white),Ns(e,-.68,J,.08,.36),Ns(e,.55,J,.22,.32),Z(e,.62,J,-.05,.38,q.foliage),Q(e,-.55,J,.48,.06)}function ku(){let e=document.createElement(`canvas`);e.width=64,e.height=40;let t=e.getContext(`2d`);t.fillStyle=`#e31c23`,t.fillRect(0,0,64,40),t.fillStyle=`#fff`,t.fillRect(24,8,16,24),t.fillRect(14,14,36,12);let n=new Ce(e);return n.colorSpace=E,n}function Au(e){Y(e,{top:q.snow,side:q.dirt,sideDark:q.sandDark}),Jo(e,K(-.55,J-.04,-.68),K(.15,J-.04,-.62),3,.26,.48,q.mountainGrey,q.snow),qo(e,.12,-.48,.42,.92);let t=wl(e,-.42,J,0,{unit:.12,w:2,d:2,snow:!0,ry:.35});wl(e,-.08,J,.2,{unit:.1,w:2,d:2,snow:!0,ry:-.2}),wl(e,-.5,J,.4,{unit:.09,w:2,d:1,snow:!0,ry:.15,chimney:!1}),Oo(e,t,{height:.25,size:.025});let n=[K(.06,J+.004,.9),K(0,J+.004,.62),K(-.22,J+.004,.38),K(-.3,J+.004,.2)];rs(e,n,.08,`#d9dde6`),Cl(e,`holiday/lantern.glb`,n.map(e=>e.clone().add(K(.08,0,0))),.22,.13),X(e,`holiday/snowman-hat.glb`,.2,J,.42,.1,-.4,{footprint:!1}),X(e,`holiday/sled.glb`,.3,J,.54,.035,.8,{footprint:!1}),X(e,`holiday/bench.glb`,-.24,J,.62,.045,.6,{footprint:!1}),X(e,`nature/log_stackLarge.glb`,-.68,J,.12,.05,1.2,{footprint:!1}),Sl(e,[`holiday/rocks-small.glb`,`holiday/rocks-medium.glb`,`holiday/snow-pile.glb`],.3,J,.25,.4,8,{h:[.025,.05],inner:.1}),Fc(e,.42,J,-.05),Ic(e,K(-.35,J+.55,-.42),K(.28,J+.28,.05)),Ms(e,-.72,J,-.12,.4,!0),Ms(e,-.58,J,.18,.3,!0),Ms(e,.68,J,.05,.38,!0),Ms(e,.55,J,.32,.3,!0),Ms(e,.22,J,-.15,.26,!0),Sl(e,[`holiday/tree-snow-a.glb`,`holiday/tree-snow-b.glb`,`holiday/tree-snow-c.glb`],.62,J,-.25,.18,6,{h:[.16,.3]}),Sl(e,[`holiday/tree-snow-a.glb`,`holiday/tree-snow-c.glb`],-.7,J,-.38,.14,4,{h:[.18,.28]}),Sl(e,[`holiday/tree-snow-b.glb`,`holiday/tree-snow-c.glb`],.62,J,.55,.12,3,{h:[.14,.22]}),Do(e,.02,J,.48,{poleHeight:.22,width:.14,height:.09,texture:ku(),pole:q.woodDark})}function ju(e){Y(e),X(e,`city-commercial/building-skyscraper-b.glb`,-.42,J,-.26,.98,.5),X(e,`city-commercial/building-skyscraper-e.glb`,.22,J,-.4,1.08,-.2),X(e,`city-commercial/building-skyscraper-a.glb`,.42,J,-.14,.78,.3),X(e,`city-commercial/building-a.glb`,-.48,J,.12,.46,0),X(e,`city-commercial/low-detail-building-a.glb`,-.24,J,-.5,.62,.15),X(e,`car/taxi.glb`,.1,J,.5,.07,.9),Dc(e,.02,J,.06,{h:.82,base:.16}),Ns(e,-.28,J,.42,.4),Ns(e,.4,J,.5,.34),Ns(e,.62,J,.22,.3),Q(e,-.08,J,.52,.06,`#f6b7d0`);let t=Array.from({length:32},(t,n)=>{let r=n/32*Math.PI*2,i=K(Math.cos(r)*.78,J+.012,Math.sin(r)*.78);return e.shore&&is(e.shore,i.x,i.z)<.06?as(e.shore,i,.06):i});mc(e,[...t,t[0]],.045),Ol(e,t.map(e=>e.clone().setY(e.y+.008)),[{file:`train/train-electric-bullet-a.glb`,reversed:!0},{file:`train/train-electric-bullet-b.glb`},{file:`train/train-electric-bullet-c.glb`},{file:`train/train-electric-bullet-b.glb`},{file:`train/train-electric-bullet-a.glb`}],{scale:.045,speed:.32})}function Mu(e){Y(e,{top:q.sand,side:q.sandDark,sideDark:q.ochreDark}),Ec(e,-.12,J,-.12,{h:.55,w:.42,d:.28,paint:`#e8c48a`,glass:q.windowBlue,cols:4,crown:`dome`}),e.add(V(),`#5c4e38`,G(.28,J,-.42,[.28,.52,.28])),e.add(V(),`#c9a44a`,G(.28,J+.5,-.42,[.08,.08,.08])),Dc(e,.48,J,.02,{h:.72,base:.1,paint:`#d4a05a`,accent:`#f0e2c4`});let t=[K(-.85,J+.004,.18),K(0,J+.004,.34),K(.85,J+.004,.16)];rs(e,t,.12,`#c4b7a0`);let n=new Le,r=_s(`car/taxi.glb`);r&&(r.scale.setScalar(.07),r.rotation.y=Math.PI/2,n.add(r)),Sc(e,t.map(e=>e.clone().setY(J+.006)),n,{from:.15,to:.85,speed:.12}),yc(e,-.6,-.4,.22,{rim:`#f4f6fa`,pods:`capsule`,gondolas:[`#f4f6fa`],count:14,speed:.1,frameColor:`#f4f6fa`}),js(e,-.7,J,0,{height:.5,lean:2.6,leanAmount:.2}),js(e,.7,J,.42,{height:.6,lean:-.4,leanAmount:.18}),Ls(e,-.52,J,.48,.26),zs(e,.42,J,.42,.11)}var Nu={miami:eu,NY:yu,madrid:$l,granada:Gl,hyeres:ql,antibes:Fl,cannes:Hl,scotland:Du,dakhla:Wl,lisbon:Zl,santiago:Eu,patagonia:xu,buenos_aires:Vl,joshua_tree:Yl,orange_county:bu,la_ventana:Xl,denver:Rl,montana:tu,mystery:du,roatan:Tu,tokyo:ju,london:Ql,brussels:Bl,amsterdam:Pl,vegas:Mu,montreal:nu,iceland:Jl,switzerland:Au,seoul:Ou,chiang_mai:Ul,bangkok:Il,hong_kong:Kl,boulder:zl,munich:uu,austria:Nl,mumbai:ru,nepal:mu},Pu=new Map;function Fu(e){return e in Nu}function Iu(e,t){let n=Nu[e];if(!n)return null;let r=t?.snow===void 0?e:`${e}:${t.snow?`snow`:`summer`}`,i=Pu.get(r);if(!i){let a=new bo(e);n(a,t),gl(a),al(a),ne&&a.detail&&ol(a),i=a.template(),Pu.set(r,i)}return So(i)}var Lu=new h({visible:!1}),Ru=class{root=new Le;list=[];build(e,n){this.dispose();for(let r of e){let e=new Le;e.position.set(r.x,0,r.z);let i=r.width*.95,a=new M(new dt(r.radius*1.05,r.radius*1.05,i,12),Lu);a.position.y=i/2-.2,a.userData={kind:`island`},e.add(a);let o={slot:r,group:e,hitProxy:a,labelAnchor:new H(r.x,0,r.z+r.radius*.95),hover:0,hovered:!1};a.userData.island=o;let s=Qa(r.city),c=n[s];!t&&Fu(s)?this.placeBuilt(o,s):c?mo(c.file).then(e=>this.placeModel(o,e.scene.clone(!0),c.scale??1,c.yOffset??0,c.rotationY??0)).catch(()=>this.placeSprite(o)):this.placeSprite(o),this.root.add(e),this.list.push(o)}}pickTargets(){return this.list.map(e=>e.hitProxy)}update(e,t,n,r){ka(t,r);for(let r of this.list){let i=+!!r.hovered;r.hover=et.damp(r.hover,i,12,e);let a=1+r.hover*.06;r.group.scale.setScalar(a),r.sprite&&r.sprite.material.color.copy(n),r.built?.update(t,e)}}async placeSprite(e){let t=await uo(e.slot.city.islandImg),n=new kt({map:t,alphaTest:.5,toneMapped:!1,fog:!0}),r=new R(n),i=t.image,a=e.slot.width;r.scale.set(a,a*i.height/i.width,1),r.center.set(.5,.1),e.sprite=r,e.group.add(r)}placeBuilt(e,t){let n=Iu(t,t===`boulder`||t===`denver`?{snow:ro(e.slot.city)}:void 0);if(!n)return this.placeSprite(e);n.object.scale.setScalar(e.slot.radius),e.group.add(n.object),e.built=n;let r=n.object.children[0];r.geometry.computeBoundingBox();let i=r.geometry.boundingBox?.max.z??1;e.labelAnchor.z=e.slot.z+e.slot.radius*(i+.1)}placeModel(e,t,n,r,i){t.rotation.y=i,t.updateMatrixWorld(!0);let a=new Ut().setFromObject(t),o=a.getSize(new H),s=e.slot.width*.92*n/Math.max(o.x,o.z,.001);t.scale.multiplyScalar(s),t.updateMatrixWorld(!0),a.setFromObject(t);let c=a.getCenter(new H);t.position.x-=c.x,t.position.z-=c.z,t.position.y+=-a.min.y-.18+r,t.traverse(e=>{let t=e;t.isMesh&&(t.userData.kind=`island-model`)}),e.group.add(t)}dispose(){for(let e of this.list)e.hitProxy.geometry.dispose(),e.sprite?.material.dispose(),this.root.remove(e.group);this.list.length=0}},zu=`
uniform float uTime;
attribute float aDist;
varying float vDist;
${m}
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  world.y = waveHeight(world.xz, uTime) + 0.025;
  vDist = aDist;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,Bu=`
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying float vDist;
void main() {
  float phase = fract(vDist / 0.6 - uTime * 0.15);
  if (phase > 0.5) discard;
  gl_FragColor = vec4(uColor, uOpacity);
}
`,Vu=class{mesh;constructor(){this.mesh=new M(new v,new De({vertexShader:zu,fragmentShader:Bu,transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uColor:{value:new N(`#ffffff`)},uOpacity:{value:.55}}})),this.mesh.frustumCulled=!1}build(e,t){let n=[],r=[],i=[],a=.07;for(let o=0;o<e.length-1;o++){let s=e[o],c=e[o+1],l;if(c.crossesYear){let e=t.find(e=>e.z>s.z&&e.z<c.z),n=e?e.z+1:(s.z+c.z)/2;l=[[s.x,s.z],[s.x,n],[c.x,n],[c.x,c.z]]}else l=[[s.x,s.z],[c.x,c.z]];Hu(l,0,s.radius*.85),Hu(l,l.length-1,c.radius*.85);let u=0;for(let e=0;e<l.length-1;e++){let[t,o]=l[e],[s,c]=l[e+1],d=Math.hypot(s-t,c-o);if(d<.001)continue;let f=Math.max(1,Math.ceil(d/.4)),p=-(c-o)/d*a,m=(s-t)/d*a,h=n.length/3;for(let e=0;e<=f;e++){let i=e/f,a=t+(s-t)*i,l=o+(c-o)*i;n.push(a-p,0,l-m,a+p,0,l+m),r.push(u+d*i,u+d*i)}for(let e=0;e<f;e++){let t=h+e*2;i.push(t,t+1,t+2,t+1,t+3,t+2)}u+=d}}let o=new v;o.setAttribute(`position`,new xe(new Float32Array(n),3)),o.setAttribute(`aDist`,new xe(new Float32Array(r),1)),o.setIndex(i),this.mesh.geometry.dispose(),this.mesh.geometry=o}update(e,t,n){let r=this.mesh.material.uniforms;r.uTime.value=e,r.uOpacity.value=t,r.uColor.value.setRGB(1-n,1-n*.45,1-n*.45)}};function Hu(e,t,n){let r=t===0?1:t-1,[i,a]=e[t],[o,s]=e[r],c=Math.hypot(o-i,s-a),l=Math.min(n/Math.max(c,.001),.45);e[t]=[i+(o-i)*l,a+(s-a)*l]}var Uu={offset:.68,repeat:.32},Wu={offset:.025,repeat:.17},Gu=class{world;root=new Le;clouds=[];cloudTex=null;shadowTex=null;cloudAspect=.5;shadowAspect=.3;shadowGeometry=new bt(1,1).rotateX(-Math.PI/2);scale=1;setScale(e){this.scale=e}constructor(e){this.world=e,uo(`images/cloud.png`).then(t=>{let n=t.image;this.cloudTex=t.clone(),this.cloudTex.repeat.set(1,Uu.repeat),this.cloudTex.offset.set(0,Uu.offset),this.shadowTex=t.clone(),this.shadowTex.repeat.set(1,Wu.repeat),this.shadowTex.offset.set(0,Wu.offset),this.cloudTex.needsUpdate=this.shadowTex.needsUpdate=!0,this.cloudAspect=n.height*Uu.repeat/n.width,this.shadowAspect=n.height*Wu.repeat/n.width;let r=e.visibleBounds();for(let e=0;e<5;e++)this.spawn(-r.halfX+Math.random()*r.halfX*2)})}update(e,t){if(!this.cloudTex)return;Math.random()<d.cloudSpawnChance*60*e&&this.spawn();let n=this.world.visibleBounds(),r=this.world.sunDir;for(let i=this.clouds.length-1;i>=0;i--){let a=this.clouds[i],o=a.sprite.position;o.x-=a.speed*e,a.sprite.material.color.copy(t),a.shadow.position.set(o.x-r.x/r.y*o.y,.1,o.z-r.z/r.y*o.y),o.x<-n.halfX-8*this.scale&&(this.root.remove(a.sprite,a.shadow),a.sprite.material.dispose(),a.shadow.material.dispose(),this.clouds.splice(i,1))}}spawn(e){if(!this.cloudTex||!this.shadowTex)return;let t=this.world.visibleBounds(),n=new R(new kt({map:this.cloudTex,transparent:!0,depthTest:!0,depthWrite:!0,alphaTest:.18,toneMapped:!1,fog:!1})),r=(2.2+Math.random()*2.4)*this.scale;n.scale.set(r,r*this.cloudAspect,1);let i=(4.5+Math.random()*2.5)*(.5+this.scale*.5);n.position.set(e??t.halfX+6*this.scale,i,t.minZ+Math.random()*(t.maxZ-t.minZ)),n.renderOrder=10;let a=new M(this.shadowGeometry,new h({map:this.shadowTex,transparent:!0,opacity:.45,depthWrite:!1,depthTest:!1,color:`#1f5560`}));a.scale.set(r*1.05,1,r*1.05*this.shadowAspect*1.6),a.renderOrder=1,this.root.add(n,a),this.clouds.push({sprite:n,shadow:a,speed:.35+Math.random()*.2})}},Ku={title:{fontWeight:700,rem:2.5,fill:[`#222222`,`#e6e6ff`],shadow:[`rgba(0,0,0,0)`,`rgba(255,255,255,0.35)`],shadowBlur:[0,18],hang:!1},year:{fontWeight:700,rem:2.2,fill:[`#2a4d69`,`#b3b3ff`],shadow:[`rgba(255,255,255,0.55)`,`rgba(179,179,255,0.5)`],shadowBlur:[6,16],hang:!1},city:{fontWeight:700,rem:1.15,fill:[`#1a3348`,`#c8c8ff`],shadow:[`rgba(255,255,255,0.85)`,`rgba(179,179,255,0.65)`],shadowBlur:[5,12],hang:!1}},qu={title:1.2,year:1,city:.7},Ju=1.05,Yu=class{overlay;group=new Le;texts=[];htmls=[];v=new H;night=!1;constructor(e,t){this.overlay=e,this.night=t,this.group.name=`labels`}addTitle(e,t){this.spawn(`title`,e,new H(0,.45,t))}addYear(e,t){this.spawn(`year`,e,new H(0,.55,t))}addCity(e,t){return this.spawn(`city`,e,new H(t.x,.42,t.z+Ju)).position}addTooltip(e,t,n=0){return this.overlay.appendChild(e),this.htmls.push({el:e,anchor:t,offsetY:n}),e}setNight(e){if(this.night!==e){this.night=e;for(let e of this.texts)this.paint(e)}}clear(){for(let e of this.texts)this.group.remove(e.sprite),e.texture.dispose(),e.sprite.material.dispose();this.texts.length=0;for(let e of this.htmls)e.el.remove();this.htmls.length=0}update(e,t){let n=window.innerWidth,r=window.innerHeight;for(let e of this.texts)e.kind===`year`&&(e.sprite.position.y=e.anchor.y+Math.sin(Math.PI/2*t)*.06,e.sprite.material.rotation=Math.sin(Math.PI/2*t)*.008);for(let t of this.htmls){if(this.v.copy(t.anchor).project(e),!(this.v.z<1&&this.v.y>-1.4&&this.v.y<1.4)){t.el.style.visibility!==`hidden`&&(t.el.style.visibility=`hidden`);continue}let i=(this.v.x*.5+.5)*n,a=(-this.v.y*.5+.5)*r+t.offsetY;t.el.style.visibility=``,t.el.style.transform=`translate3d(${i.toFixed(1)}px, ${a.toFixed(1)}px, 0) translate(-50%, 0)`}}spawn(e,t,n){let r=document.createElement(`canvas`),i=new Ce(r);i.colorSpace=E,i.minFilter=ye,i.magFilter=ye;let a=new kt({map:i,transparent:!0,depthTest:!0,depthWrite:!1,alphaTest:.04,toneMapped:!1,fog:!1,sizeAttenuation:!0}),o=new R(a);o.position.copy(n),o.center.set(.5,Ku[e].hang?1:.5),o.renderOrder=11,o.layers.set(1),this.group.add(o);let s={kind:e,text:t,sprite:o,texture:i,canvas:r,dpr:Math.min(2,window.devicePixelRatio||1)*2,anchor:n.clone()};return this.paint(s),this.texts.push(s),o}paint(e){let t=Ku[e.kind],n=+!!this.night,r=parseFloat(getComputedStyle(document.documentElement).fontSize)||16,i=t.rem*r,a=e.dpr,o=e.canvas.getContext(`2d`),s=`${t.fontWeight} ${i}px 'Segoe UI', Arial, sans-serif`;o.font=s;let c=t.shadowBlur[n]+8,l=Math.ceil(o.measureText(e.text).width+c*2),u=Math.ceil(i*1.35+c*2);e.canvas.width=Math.max(1,Math.ceil(l*a)),e.canvas.height=Math.max(1,Math.ceil(u*a)),o.setTransform(a,0,0,a,0,0),o.clearRect(0,0,l,u),o.font=s,o.textAlign=`center`,o.textBaseline=`middle`,o.fillStyle=t.fill[n],o.shadowColor=t.shadow[n],o.shadowBlur=t.shadowBlur[n],o.shadowOffsetY=e.kind===`city`?1:2,o.fillText(e.text,l/2,u/2),e.texture.needsUpdate=!0;let d=qu[e.kind];e.sprite.scale.set(d*(e.canvas.width/e.canvas.height),d,1)}};function Xu(e,t){let n=e.replace(/!\[([^\]]*)\]\(([^)]+)\)/gm,(e,n,r)=>`<div class="image-container"><img src="${t(r)}" alt="${n}"></div>`),r=[];for(let e of n.split(`
`)){if(e.trim()===``){r.push(``);continue}if(e.includes(`<div class="image-container">`)){r.push(e);continue}let t=e.replace(/^### (.*$)/gim,`<h3>$1</h3>`).replace(/^## (.*$)/gim,`<h2>$1</h2>`).replace(/^# (.*$)/gim,`<h1>$1</h1>`).replace(/\*\*(.*?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.*?)\*/g,`<em>$1</em>`).replace(/__(.*?)__/g,`<strong>$1</strong>`).replace(/_(.*?)_/g,`<em>$1</em>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);/^<(h[1-6]|div)/.test(t)||(t=`<p>${t}</p>`),r.push(t)}return r.join(``).replace(/<p><\/p>/g,``).replace(/<\/p><p>/g,`</p>
<p>`)}var Zu=e=>document.getElementById(e);function Qu(e){return/^(https?:|data:|\/)/.test(e)?e:se(e)}var $u=class{current=null;overlay=Zu(`blog-overlay`);onOpenChange=()=>{};constructor(){Zu(`share-button`).addEventListener(`click`,()=>this.copyLink()),Zu(`close-button`).addEventListener(`click`,()=>this.close()),Zu(`prev-button`).addEventListener(`click`,()=>this.navigate(-1)),Zu(`next-button`).addEventListener(`click`,()=>this.navigate(1)),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),document.addEventListener(`keydown`,e=>{this.isOpen&&(e.key===`Escape`?this.close():e.key===`ArrowLeft`?this.navigate(-1):e.key===`ArrowRight`&&this.navigate(1))}),window.addEventListener(`popstate`,()=>this.syncWithUrl())}get isOpen(){return this.overlay.classList.contains(`active`)}syncWithUrl(){let e=new URLSearchParams(window.location.search);if(e.get(`blog`)===`latest`){this.openLatest();return}let t=e.get(`city`),n=t?Xa.find(e=>e.blog&&e.name.toLowerCase()===t.toLowerCase()):void 0;n?this.isOpen&&this.current===n||this.open(n,!1):this.isOpen&&this.close(!1)}openLatest(){let e=$a();e.length&&this.open(e[e.length-1])}async open(e,t=!0){if(!e.blog)return;let n;try{let t=await fetch(se(e.blog));if(!t.ok)throw Error(`HTTP ${t.status}`);n=await t.text()}catch(e){console.error(`Error loading blog post:`,e),alert(`Error loading blog post. Please try again.`);return}this.current=e,Zu(`blog-title`).textContent=e.blogTitle??e.name;let r=Zu(`blog-hero`),i=e.islandGif??e.islandImg;r.innerHTML=`<img src="${se(i)}" alt="${e.name}">`,this.renderText(n),this.updateNav(),this.overlay.classList.add(`active`),Zu(`blog-content`).scrollTop=0,document.body.classList.add(`reading`),this.onOpenChange(!0),t&&window.history.pushState({},document.title,`${window.location.pathname}?city=${encodeURIComponent(e.name)}`)}close(e=!0){this.overlay.classList.remove(`active`),Zu(`blog-title`).textContent=``,Zu(`blog-text`).innerHTML=``,Zu(`blog-hero`).innerHTML=``,this.current=null,document.body.classList.remove(`reading`),this.onOpenChange(!1),e&&window.history.pushState({},document.title,window.location.pathname)}navigate(e){let t=$a(),n=this.current?t.indexOf(this.current):-1,r=n>=0?t[n+e]:void 0;r&&this.open(r)}renderText(e){let t=document.createElement(`div`);t.innerHTML=Xu(e,Qu);let n=``;t.querySelectorAll(`p, h1, h2, h3, h4, h5, h6, div.image-container`).forEach((e,t)=>{if(!e.textContent?.trim()&&!e.classList.contains(`image-container`))return;let r=e.tagName.toLowerCase(),i=e.classList.contains(`image-container`)?`image-container paragraph-fade`:`paragraph-fade`;n+=`<${r} class="${i}" style="animation-delay: ${t*.3}s;">${e.innerHTML}</${r}>`}),Zu(`blog-text`).innerHTML=n}updateNav(){let e=$a(),t=this.current?e.indexOf(this.current):-1,n=t>0?e[t-1]:null,r=t>=0&&t<e.length-1?e[t+1]:null,i=Zu(`prev-button`),a=Zu(`next-button`);i.textContent=n?`${n.blogTitle} →`:``,i.style.visibility=n?`visible`:`hidden`,a.textContent=r?`← ${r.blogTitle}`:``,a.style.visibility=r?`visible`:`hidden`}async copyLink(){if(!this.current)return;let e=`${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(this.current.name)}`;try{await navigator.clipboard.writeText(e)}catch{let t=document.createElement(`textarea`);t.value=e,t.style.cssText=`position:fixed;left:-9999px;top:-9999px`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove()}let t=Zu(`share-button`);t.textContent=`Copied!`,t.classList.add(`copied`),setTimeout(()=>{t.textContent=`Share`,t.classList.remove(`copied`)},2e3)}},ed;function td(e,t){let n=document.getElementById(`quote-display`);n||(n=document.createElement(`div`),n.id=`quote-display`,n.addEventListener(`click`,()=>n.remove()),document.body.appendChild(n)),n.replaceChildren();let r=document.createElement(`span`);r.textContent=e,n.appendChild(r),window.clearTimeout(ed),t&&(ed=window.setTimeout(()=>n?.remove(),t*1e3))}var nd=`modulepreload`,rd=function(e,t){return new URL(e,t).href},id={},ad=function(e){return e.pathname.endsWith(`.css`)},od=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},sd=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=rd(t,n);let r=s(t),i=ad(r);return od(id,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:nd,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},cd=`https://cit.earth/trail/`;async function ld(){document.getElementById(`reward-card`)?.remove();let e=document.createElement(`div`);e.id=`reward-card`,e.setAttribute(`role`,`dialog`),e.innerHTML=`
    <button class="reward-close" aria-label="Close">×</button>
    <div class="reward-icon">🏆</div>
    <p class="reward-text">Congratulations adventurer! You've defeated the boss ship and unlocked the Nomad Trail mini game.</p>
    <div class="reward-action"></div>`,e.querySelector(`.reward-close`).addEventListener(`click`,()=>e.remove()),document.body.appendChild(e);let t=e.querySelector(`.reward-action`);if(O||Qe()){t.innerHTML=`<a class="reward-play" href="${cd}" target="_blank" rel="noopener">Play Now</a>`;return}let{toString:n}=await sd(async()=>{let{toString:e}=await import(`./browser-O5ROug6_.js`).then(e=>en(e.default,1));return{toString:e}},[],import.meta.url);t.innerHTML=`
    <div class="reward-qr">${await n(cd,{type:`svg`,margin:1,color:{dark:`#1f2d3a`,light:`#ffffff`}})}</div>
    <div class="reward-hint">Scan with your phone to play</div>
    <a class="reward-link" href="${cd}" target="_blank" rel="noopener">or open it here</a>`}var ud=e=>document.getElementById(e);function dd(e){return e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e])}function fd(e){let t=e.slot.city,n=document.createElement(`div`);n.className=`island-label`;let r=t.stops?.map(e=>`
      <div class="city-stop">
        <div class="city-stop-name">${dd(e.name)}${e.subtitle?` <span class="city-stop-sub">${dd(e.subtitle)}</span>`:``}</div>
        <div class="city-dates">${dd(e.dates)}<span class="right">${dd(e.duration)}</span></div>
      </div>`).join(``);return r?(n.innerHTML=`<div class="island-tooltip">${r}${t.blog?`<a>${dd(t.blogTitle??``)}</a>`:``}</div>`,n):(n.innerHTML=`
    <div class="island-tooltip">
      ${t.subtitle?`<div class="city-subtitle">${dd(t.subtitle)}</div>`:``}
      <div class="city-dates">${dd(t.dates)}${t.subtitle?`<span class="right">${dd(t.duration)}</span>`:``}</div>
      ${t.subtitle?``:`<div class="city-duration">${dd(t.duration)}</div>`}
      ${t.blog?`<a>${dd(t.blogTitle??``)}</a>`:``}
    </div>`,n)}function pd(e){let t=e;for(;t;){if(t.userData.kind)return{kind:t.userData.kind,target:t};t=t.parent}return null}async function md(){if(!fa.isWebGL2Available()){window.location.replace(`../map/`+window.location.search);return}let e=new URLSearchParams(window.location.search).get(`preview`);if(e!==null){let{runPreview:t}=await sd(async()=>{let{runPreview:e}=await import(`./preview-DS5eA6rY.js`);return{runPreview:e}},__vite__mapDeps([0,1]),import.meta.url);await t(e);return}let t=localStorage.getItem(`night-mode`)===`true`;document.body.classList.toggle(`night-mode`,t),document.documentElement.classList.remove(`night-preload`);let n=new Ka(ud(`scene`),ud(`scroll-spacer`),t);n.fx.setStyle(ja());let r=ms(),i=await fo(),a=!1,o=new Yu(ud(`labels`),t),s=new Ru,c=new Vu,l=new Gu(n),u=ud(`sunk-ships-counter`),f=new $u;n.add(s.root,c.mesh,l.root,o.group);let p=null,m,h=new Map;function g(){m=oo(window.innerWidth),s.build(a?m.islands:[],i),c.build(m.islands,m.years),n.ocean.setIslands(m.islands),p?.setIslands(m.islands),o.clear(),h.clear(),o.addTitle(`Citizen Earth`,m.titleZ);for(let e of m.years)o.addYear(String(e.year),e.z);for(let e of s.list){let t=o.addCity(e.slot.city.name,e.labelAnchor);h.set(e,o.addTooltip(fd(e),t,22))}n.configureView(m.halfWidth,m.titleZ,m.endZ),p?.setViewportHeight(window.innerHeight),l.setScale(m.columns===1?.45:m.columns===2?.7:1)}g();let _=window.innerWidth,v;window.addEventListener(`resize`,()=>{window.clearTimeout(v),v=window.setTimeout(()=>{let e=n.focus.z;window.innerWidth!==_&&oo(window.innerWidth).columns!==m.columns?g():(n.configureView(m.halfWidth,m.titleZ,m.endZ),p?.setViewportHeight(window.innerHeight)),_=window.innerWidth,window.scrollTo({top:n.scrollYFor(e),behavior:`instant`})},120)});function y(e,t){let r=n.raycast(e,t,p?.pickTargets()??[])??n.raycast(e,t,s.pickTargets());return r?pd(r.object):null}let b=null;function x(e){b!==e&&(b&&(b.hovered=!1),b=e,b&&(b.hovered=!0))}if(!O){let e=null;window.addEventListener(`pointermove`,t=>{e=t}),n.onUpdate(()=>{if(!e||f.isOpen)return;let t=y(e.clientX,e.clientY);x(t?.kind===`island`?t.target.userData.island:null);let n=t&&(t.kind!==`island`||!!b?.slot.city.blog);document.body.style.cursor=n?`pointer`:`default`})}ud(`scene`).addEventListener(`click`,e=>{let t=y(e.clientX,e.clientY);if(t)switch(t.kind){case`ship`:p?.battle.fireAt(t.target.userData.ship);break;case`flotsam`:p?.battle.flotsamClicked();break;case`bottle`:{let e=p?.bottles.quoteFor(t.target)??null;e!==null&&td(`"${Za[e]}"`,d.quoteDisplaySeconds);break}case`island`:{let e=t.target.userData.island.slot.city;e.blog&&f.open(e);break}}});let S=new H;function C(){let e=s.list;if(!e.length)return;let t=document.documentElement.scrollHeight-window.innerHeight;if(window.scrollY<=50)return x(e[0]);if(window.scrollY>=t-50)return x(e[e.length-1]);let r=null,i=.5;for(let t of e){S.set(t.slot.x,t.slot.width*.4,t.slot.z).project(n.camera);let e=Math.abs(S.y-.1);e<i&&(r=t,i=e)}x(r)}n.onUpdate((e,t)=>{O&&C();let r=n.theme.current;p?.update(e,t),s.update(e,t,r.spriteTint,n.theme.blend),l.update(e,r.spriteTint),c.update(t,r.routeOpacity,n.theme.blend),o.update(n.camera,t);for(let[e,t]of h)t.classList.toggle(`show`,e.hovered)});function w(){n.theme.night=!n.theme.night,document.body.classList.toggle(`night-mode`,n.theme.night),localStorage.setItem(`night-mode`,String(n.theme.night)),o.setNight(n.theme.night)}if(ud(`night-toggle`).addEventListener(`click`,w),ud(`latest-blog`).addEventListener(`click`,()=>f.openLatest()),document.addEventListener(`keydown`,e=>{e.key.toLowerCase()!==`n`||e.ctrlKey||e.altKey||e.metaKey||f.isOpen||w()}),f.onOpenChange=e=>{n.paused=e},n.start(),ud(`loading`).classList.add(`done`),r.then(()=>{a=!0,g()}),f.syncWithUrl(),Qe()){let e=io(),t=m.islands.find(t=>t.index===e);t&&window.scrollTo({top:n.scrollYFor(t.z),behavior:`smooth`})}let{Game:T}=await sd(async()=>{let{Game:e}=await import(`./Game-B7loHA1_.js`);return{Game:e}},__vite__mapDeps([2,1]),import.meta.url);p=await T.create(n,Za.length,{onSunkChange(e){u.style.display=e>0?`block`:`none`,u.textContent=`Ships Sunk: ${e}`},onFlotsamClicked(){ld()}}),p.setIslands(m.islands),p.setViewportHeight(window.innerHeight),tt&&Object.assign(window,{__ce:{world:n,islands:s,game:p}})}md();export{Ba as a,ka as c,Qt as d,uo as i,ga as l,Nu as n,za as o,ms as r,ja as s,Iu as t,da as u};