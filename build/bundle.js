
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\trostland\MergedRoster.svelte generated by Svelte v3.44.3 */

    const file$2 = "src\\trostland\\MergedRoster.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (123:0) {:else}
    function create_else_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Nothing to do here!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(123:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:3) {:else}
    function create_else_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "width", "162px");
    			add_location(div, file$2, 68, 3, 1390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(68:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:3) {#if u.spreadsheetUser != null}
    function create_if_block_6(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div0;
    	let t1_value = /*u*/ ctx[1].spreadsheetUser.seismicName + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*u*/ ctx[1].spreadsheetUser.bungieName + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let t6_value = /*u*/ ctx[1].spreadsheetUser.rowNumber + "";
    	let t6;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text("row ");
    			t6 = text(t6_value);
    			if (!src_url_equal(img.src, img_src_value = "https://cdn-icons-png.flaticon.com/512/2965/2965327.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "bn-bungie-icon svelte-162e5h6");
    			add_location(img, file$2, 61, 4, 1035);
    			attr_dev(div0, "class", "bn-account-name svelte-162e5h6");
    			add_location(div0, file$2, 63, 5, 1150);
    			attr_dev(div1, "class", "bn-bungie-name svelte-162e5h6");
    			add_location(div1, file$2, 64, 5, 1223);
    			attr_dev(div2, "class", "bn-bungie-name svelte-162e5h6");
    			add_location(div2, file$2, 65, 5, 1294);
    			add_location(div3, file$2, 62, 4, 1138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t1_value !== (t1_value = /*u*/ ctx[1].spreadsheetUser.seismicName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*mergedUsers*/ 1 && t3_value !== (t3_value = /*u*/ ctx[1].spreadsheetUser.bungieName + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*mergedUsers*/ 1 && t6_value !== (t6_value = /*u*/ ctx[1].spreadsheetUser.rowNumber + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(61:3) {#if u.spreadsheetUser != null}",
    		ctx
    	});

    	return block;
    }

    // (91:3) {:else}
    function create_else_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "width", "162px");
    			add_location(div, file$2, 91, 3, 2307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(91:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:3) {#if u.bungieUser != null}
    function create_if_block_3$1(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;
    	let t0;
    	let div2;
    	let div0;
    	let t1_value = /*u*/ ctx[1].bungieUser.accountName + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*u*/ ctx[1].bungieUser.bungieName + "";
    	let t3;
    	let t4;

    	function select_block_type_2(ctx, dirty) {
    		if (/*u*/ ctx[1].bungieUser.lastOnlineDaysAgo > 56) return create_if_block_4;
    		if (/*u*/ ctx[1].bungieUser.lastOnlineDaysAgo > 28) return create_if_block_5;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if_block.c();
    			if (!src_url_equal(img.src, img_src_value = "https://help.bungie.net/hc/article_attachments/360094766612/shield.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "bn-bungie-icon svelte-162e5h6");
    			add_location(img, file$2, 77, 4, 1615);
    			attr_dev(a, "href", a_href_value = /*u*/ ctx[1].bungieUser.url);
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 76, 3, 1538);
    			attr_dev(div0, "class", "bn-account-name svelte-162e5h6");
    			add_location(div0, file$2, 80, 5, 1754);
    			attr_dev(div1, "class", "bn-bungie-name svelte-162e5h6");
    			add_location(div1, file$2, 81, 5, 1822);
    			add_location(div2, file$2, 79, 4, 1742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			if_block.m(div2, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && a_href_value !== (a_href_value = /*u*/ ctx[1].bungieUser.url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*mergedUsers*/ 1 && t1_value !== (t1_value = /*u*/ ctx[1].bungieUser.accountName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*mergedUsers*/ 1 && t3_value !== (t3_value = /*u*/ ctx[1].bungieUser.bungieName + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(76:3) {#if u.bungieUser != null}",
    		ctx
    	});

    	return block;
    }

    // (87:5) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" days ago");
    			attr_dev(div, "class", "bn-bungie-name svelte-162e5h6");
    			add_location(div, file$2, 87, 6, 2191);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t0_value !== (t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(87:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:51) 
    function create_if_block_5(ctx) {
    	let div;
    	let t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" days ago");
    			attr_dev(div, "class", "bn-bungie-name text-yellow svelte-162e5h6");
    			add_location(div, file$2, 85, 6, 2082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t0_value !== (t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(85:51) ",
    		ctx
    	});

    	return block;
    }

    // (83:5) {#if u.bungieUser.lastOnlineDaysAgo > 56}
    function create_if_block_4(ctx) {
    	let div;
    	let t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" days ago");
    			attr_dev(div, "class", "bn-bungie-name text-red svelte-162e5h6");
    			add_location(div, file$2, 83, 6, 1937);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t0_value !== (t0_value = /*u*/ ctx[1].bungieUser.lastOnlineDaysAgo + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(83:5) {#if u.bungieUser.lastOnlineDaysAgo > 56}",
    		ctx
    	});

    	return block;
    }

    // (115:3) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "width", "162px");
    			add_location(div, file$2, 115, 3, 3276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(115:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:3) {#if u.seismicUser != null}
    function create_if_block$1(ctx) {
    	let img0;
    	let img0_src_value;
    	let t0;
    	let a;
    	let img1;
    	let img1_src_value;
    	let a_href_value;
    	let t1;
    	let div2;
    	let div0;
    	let t2_value = /*u*/ ctx[1].seismicUser.seismicName + "";
    	let t2;
    	let t3;
    	let div1;
    	let t5;

    	function select_block_type_4(ctx, dirty) {
    		if (/*u*/ ctx[1].seismicUser.lastOnlineStatus == 'warning') return create_if_block_1$1;
    		if (/*u*/ ctx[1].seismicUser.lastOnlineStatus == 'danger') return create_if_block_2$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t0 = space();
    			a = element("a");
    			img1 = element("img");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "_";
    			t5 = space();
    			if_block.c();
    			if (!src_url_equal(img0.src, img0_src_value = /*u*/ ctx[1].seismicUser.imageUrl)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "bn-bungie-avatar svelte-162e5h6");
    			attr_dev(img0, "alt", "avatar");
    			add_location(img0, file$2, 99, 4, 2458);
    			if (!src_url_equal(img1.src, img1_src_value = "https://seismicgaming.eu/assets/images/esports/logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "bn-bungie-icon svelte-162e5h6");
    			add_location(img1, file$2, 101, 5, 2617);
    			attr_dev(a, "href", a_href_value = /*u*/ ctx[1].seismicUser.url);
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 100, 4, 2538);
    			attr_dev(div0, "class", "bn-account-name svelte-162e5h6");
    			add_location(div0, file$2, 104, 5, 2742);
    			attr_dev(div1, "class", "bn-bungie-name svelte-162e5h6");
    			set_style(div1, "opacity", "0");
    			add_location(div1, file$2, 105, 5, 2811);
    			add_location(div2, file$2, 103, 4, 2730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div2, t5);
    			if_block.m(div2, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && !src_url_equal(img0.src, img0_src_value = /*u*/ ctx[1].seismicUser.imageUrl)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*mergedUsers*/ 1 && a_href_value !== (a_href_value = /*u*/ ctx[1].seismicUser.url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*mergedUsers*/ 1 && t2_value !== (t2_value = /*u*/ ctx[1].seismicUser.seismicName + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(99:3) {#if u.seismicUser != null}",
    		ctx
    	});

    	return block;
    }

    // (111:5) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "bn-bungie-name svelte-162e5h6");
    			add_location(div, file$2, 111, 6, 3171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t_value !== (t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(111:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (109:58) 
    function create_if_block_2$1(ctx) {
    	let div;
    	let t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "bn-bungie-name text-red svelte-162e5h6");
    			add_location(div, file$2, 109, 6, 3076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t_value !== (t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(109:58) ",
    		ctx
    	});

    	return block;
    }

    // (107:5) {#if u.seismicUser.lastOnlineStatus == 'warning'}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "bn-bungie-name text-yellow svelte-162e5h6");
    			add_location(div, file$2, 107, 6, 2932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mergedUsers*/ 1 && t_value !== (t_value = /*u*/ ctx[1].seismicUser.lastOnlineText + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(107:5) {#if u.seismicUser.lastOnlineStatus == 'warning'}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#each mergedUsers as u}
    function create_each_block(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*u*/ ctx[1].spreadsheetUser != null) return create_if_block_6;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*u*/ ctx[1].bungieUser != null) return create_if_block_3$1;
    		return create_else_block_3;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*u*/ ctx[1].seismicUser != null) return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type_2 = select_block_type_3(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			if_block2.c();
    			t2 = space();
    			attr_dev(div0, "class", "bn-subitem svelte-162e5h6");
    			add_location(div0, file$2, 59, 2, 969);
    			attr_dev(div1, "class", "bn-subitem svelte-162e5h6");
    			add_location(div1, file$2, 74, 2, 1478);
    			attr_dev(div2, "class", "bn-subitem svelte-162e5h6");
    			add_location(div2, file$2, 97, 2, 2396);
    			attr_dev(div3, "class", "bn-item svelte-162e5h6");
    			add_location(div3, file$2, 55, 2, 907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if_block1.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block2.m(div2, null);
    			append_dev(div3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:0) {#each mergedUsers as u}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*mergedUsers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_5(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mergedUsers*/ 1) {
    				each_value = /*mergedUsers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block_5(ctx);
    					each_1_else.c();
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MergedRoster', slots, []);
    	let { mergedUsers } = $$props;
    	const writable_props = ['mergedUsers'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MergedRoster> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('mergedUsers' in $$props) $$invalidate(0, mergedUsers = $$props.mergedUsers);
    	};

    	$$self.$capture_state = () => ({ mergedUsers });

    	$$self.$inject_state = $$props => {
    		if ('mergedUsers' in $$props) $$invalidate(0, mergedUsers = $$props.mergedUsers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mergedUsers];
    }

    class MergedRoster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { mergedUsers: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MergedRoster",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mergedUsers*/ ctx[0] === undefined && !('mergedUsers' in props)) {
    			console.warn("<MergedRoster> was created without expected prop 'mergedUsers'");
    		}
    	}

    	get mergedUsers() {
    		throw new Error("<MergedRoster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mergedUsers(value) {
    		throw new Error("<MergedRoster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * bungie.net users data source
     */
    class BungieNetDataSource {
        async getUsers() {
            let chaosUsers = await this.addClanRoster(3135419);
            let juggsUsers = await this.addClanRoster(3285991);
            let pathsUsers = await this.addClanRoster(3909446);
            let userMap = new Map();
            userMap.set('chaos', chaosUsers);
            userMap.set('juggernauts', juggsUsers);
            userMap.set('pathfinders', pathsUsers);
            return userMap;
        }
        async bungieGet(endpoint) {
            let bungoApiKey = '84e133a91eea4882b9a0bf6f404ef782';
            let bungoParam = { headers: { 'X-API-Key': bungoApiKey } };
            let apiRootPath = 'https://www.bungie.net/Platform';
            let url = apiRootPath + endpoint;
            let fetchResponse = await fetch(url, bungoParam);
            let reportJson = await fetchResponse.json();
            return reportJson;
        }
        async addClanRoster(clanId) {
            let usersArray = new Array();
            let chaosList = await this.bungieGet(`/GroupV2/${clanId}/Members/`);
            console.log(chaosList);
            console.log(`code: ${chaosList.ErrorCode}  |  status: ${chaosList.ErrorStatus}`);
            let items = chaosList.Response.results;
            console.log(items);
            for (const item of items) {
                //console.log(item);
                let basicName = "[REDACTED]";
                let bungieName = "[REDACTED]";
                let bungieId = "[REDACTED]";
                if (item.bungieNetUserInfo != undefined) {
                    basicName = item.bungieNetUserInfo.displayName;
                    bungieName = item.bungieNetUserInfo.supplementalDisplayName;
                    bungieId = item.destinyUserInfo.membershipId;
                }
                else if (item.destinyUserInfo) {
                    let name = item.destinyUserInfo.bungieGlobalDisplayName;
                    let code = item.destinyUserInfo.bungieGlobalDisplayNameCode;
                    basicName = name;
                    bungieName = name + '#' + code;
                    bungieId = item.destinyUserInfo.membershipId;
                }
                let lastOnline = new Date(item.lastOnlineStatusChange * 1000);
                let currentDate = new Date();
                let timePassed = +currentDate - +lastOnline;
                let daysPassed = Math.round(timePassed / 86400000 / 1 * 10) / 10;
                let profileUrl = `https://www.bungie.net/7/en/User/Profile/3/${bungieId}`;
                let bUser = new BungieUser(basicName, bungieName, profileUrl, daysPassed);
                usersArray.push(bUser);
            }
            return usersArray;
        }
    }
    /**
     * Spreadsheet users data source
     */
    class SpreadsheetDataSource {
        /**
         * Loads the file from event arguments and send it to reading
         */
        async onFileChange(event) {
            let fileList = event.target.files;
            let file = fileList[0];
            let data = await file.text();
            let ssUsers = await this.readSpreadsheetTsv(data);
            return ssUsers;
        }
        /**
         * Reades tsv text into array of SpreadsheetUsers
         */
        async readSpreadsheetTsv(tsvText) {
            let lines = tsvText.split('\n');
            let items = new Map();
            let rowNumber = 0;
            let currentArray = null;
            for (let line of lines) {
                rowNumber++;
                let parts = line.split('\t');
                let sgName = parts[0].trim();
                let bnName = parts[1].trim();
                console.log(`${rowNumber} : ${sgName} : ${bnName}`);
                if (sgName.length == 0 && bnName.length == 0) {
                    continue;
                }
                if (sgName == 'Chaos' || sgName == 'Juggernauts' || sgName == 'Pathfinders') {
                    currentArray = new Array();
                    items.set(sgName.toLowerCase(), currentArray);
                    continue;
                }
                let newUser = new SpreadsheetUser(rowNumber, sgName, bnName);
                currentArray.push(newUser);
            }
            console.log(items);
            return items;
        }
    }
    /**
     * Seismic website data source
     */
    class SeismicDataSource {
        /** Loads the file from event arguments and send it to reading */
        async onFileChange(event) {
            let fileList = event.target.files;
            let file = fileList[0];
            let data = await file.text();
            let sgUsers = this.readSeismicRosterText(data);
            return sgUsers;
        }
        /** Reads seismic roster html text into SeismicUsers */
        readSeismicRosterText(data) {
            let parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");
            let tableRows = htmlDoc.getElementsByTagName("table")[0].rows;
            let newSeismicUsers = new Array();
            for (let trElement of tableRows) {
                let nameElement = trElement.getElementsByClassName('alc-event-results-cell__player-nickname')[0];
                let timeagoElement = trElement.getElementsByClassName('highlight')[0];
                let linkElement = trElement.getElementsByClassName('btn-default-alt')[0];
                let imageElement = trElement.getElementsByClassName('lazy')[0];
                if (nameElement != undefined && timeagoElement != undefined && linkElement != undefined) {
                    let name = nameElement.textContent.trim();
                    let timeago = timeagoElement.textContent.trim();
                    let link = linkElement.getAttribute("href");
                    let imageUrl = imageElement.getAttribute("data-src");
                    let newUser = new SeismicUser(name, link, timeago);
                    newUser.imageUrl = imageUrl;
                    newUser.lastOnlineStatus = 'okay';
                    if (timeago.includes('month'))
                        newUser.lastOnlineStatus = 'danger';
                    if (timeago.includes('Never'))
                        newUser.lastOnlineStatus = 'danger';
                    if (timeago.includes('3 weeks'))
                        newUser.lastOnlineStatus = 'warning';
                    newSeismicUsers.push(newUser);
                }
            }
            return newSeismicUsers;
        }
    }

    class BungieUser {
        constructor(name, bungieName, profileUrl, daysAgo) {
            this.accountName = name;
            this.bungieName = bungieName;
            this.id = -1;
            this.url = profileUrl;
            this.lastOnlineDaysAgo = daysAgo;
        }
    }
    /** Seismic Gaming user descriptor */
    class SeismicUser {
        constructor(name, profileUrl, lastOnlineText) {
            this.seismicName = name;
            this.lastOnlineText = lastOnlineText;
            this.url = profileUrl;
        }
    }
    class SpreadsheetUser {
        constructor(rownum, sname, bname) {
            this.seismicName = sname;
            this.bungieName = bname;
            this.rowNumber = rownum;
        }
    }
    /** Bungie + Seismic + Spreadsheet user links */
    class MergedUser {
        constructor(ssUser, sgUser, bnUser) {
            this.spreadsheetUser = ssUser;
            this.seismicUser = sgUser;
            this.bungieUser = bnUser;
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - 
    class Merger {
        /* ------------ 0. Constructor ------------ */
        constructor() {
            this.clanNames = new Array();
            this.clanNames.push("chaos");
            this.clanNames.push("juggernauts");
            this.clanNames.push("pathfinders");
            this.clanNames.push("empty");
            this.spreadsheetUsers = new Map();
            this.bungieUsers = new Map();
            this.seismicUsers = new Array();
            this.mergedUsers = new Map();
            for (let clanName of this.clanNames) {
                this.spreadsheetUsers.set(clanName, new Array());
                this.bungieUsers.set(clanName, new Array());
                this.mergedUsers.set(clanName, new Array());
            }
        }
        /* ------------ 1. Users merging ------------ */
        /** Merges three profiles of each user in one container when they match each other */
        mergeUsers() {
            let hashLength = 5;
            let mergedSeismicUsers = new Array();
            for (let clanKey of this.clanNames) {
                if (clanKey == "empty")
                    continue;
                let mergedClanUsers = new Array();
                let mergedBungieClanUsers = new Array();
                let spreadsheetClanUsers = this.spreadsheetUsers.get(clanKey);
                let bungieClanUsers = this.bungieUsers.get(clanKey);
                // 1. Merge spreadsheet users
                for (let ssUser of spreadsheetClanUsers) {
                    let mergedUser = new MergedUser(null, null, null);
                    mergedUser.spreadsheetUser = ssUser;
                    // 1.1. Find matching Seismic user
                    let ssSeismicNameHash = ssUser.seismicName.toLowerCase().replace('sg_', '').substring(0, hashLength);
                    for (let sgUser of this.seismicUsers) {
                        let sgNameHash = sgUser.seismicName.toLowerCase().replace('sg_', '').substring(0, hashLength);
                        if (ssSeismicNameHash == sgNameHash) {
                            mergedUser.seismicUser = sgUser;
                            mergedSeismicUsers.push(sgUser);
                            break;
                        }
                    }
                    // 1.2. Find matching Bungie user
                    let ssBungieNameHash = ssUser.bungieName.toLowerCase().substring(0, hashLength);
                    for (let bnUser of bungieClanUsers) {
                        let bnNameHash = bnUser.bungieName.toLowerCase().substring(0, hashLength);
                        if (ssBungieNameHash == bnNameHash) {
                            mergedUser.bungieUser = bnUser;
                            mergedBungieClanUsers.push(bnUser);
                            break;
                        }
                    }
                    mergedClanUsers.push(mergedUser);
                }
                // 2. Find unmatched bungie users and create MergedUsers for them
                let unmatchedBungieUsers = new Array();
                for (let bnUser of bungieClanUsers) {
                    if (mergedBungieClanUsers.includes(bnUser, 0) == false)
                        unmatchedBungieUsers.push(bnUser);
                }
                for (let bnUser of unmatchedBungieUsers) {
                    let mergedUser = new MergedUser(null, null, null);
                    mergedUser.bungieUser = bnUser;
                    mergedClanUsers.push(mergedUser);
                }
                // 3. Insert created MergedUsers in the dictionary
                this.mergedUsers.set(clanKey, mergedClanUsers);
            }
            this.fillEmptyClanUsers();
        }
        /** Find unmatched Seismic users and create MergedUsers for them in 'empty' clan */
        fillEmptyClanUsers() {
            // 1. Find all matched seismic users
            let matchedSeismicUsers = new Set();
            for (let clanUsers of this.mergedUsers.values()) {
                for (let clanUser of clanUsers) {
                    if (clanUser.seismicUser != null)
                        matchedSeismicUsers.add(clanUser.seismicUser);
                }
            }
            // 2. Find unmatched users and create MergedUser objects for them
            let mergedEmptyClanUsers = new Array();
            for (let sgUser of this.seismicUsers) {
                if (matchedSeismicUsers.has(sgUser))
                    continue;
                let mergedUser = new MergedUser(null, sgUser, null);
                mergedEmptyClanUsers.push(mergedUser);
            }
            this.mergedUsers.set('empty', mergedEmptyClanUsers);
        }
        /* ------------ 4. Spreadsheet reading ------------ */
        async openTsvFile(e) {
            let tsvDataSource = new SpreadsheetDataSource();
            let tsvUsers = await tsvDataSource.onFileChange(e);
            this.spreadsheetUsers.set('chaos', tsvUsers.get('chaos'));
            this.spreadsheetUsers.set('juggernauts', tsvUsers.get('juggernauts'));
            this.spreadsheetUsers.set('pathfinders', tsvUsers.get('pathfinders'));
        }
        async loadBungieUsers() {
            let bungieDataSource = new BungieNetDataSource();
            let bnUsers = await bungieDataSource.getUsers();
            this.bungieUsers.set('chaos', bnUsers.get('chaos'));
            this.bungieUsers.set('juggernauts', bnUsers.get('juggernauts'));
            this.bungieUsers.set('pathfinders', bnUsers.get('pathfinders'));
        }
        async openHtmlFile(e) {
            let sgds = new SeismicDataSource();
            let sgUsers = await sgds.onFileChange(e);
            this.seismicUsers = sgUsers;
        }
    }

    /* src\trostland\MainScreen.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\trostland\\MainScreen.svelte";

    // (153:1) {#if displayChaos}
    function create_if_block_3(ctx) {
    	let mergedroster;
    	let current;

    	mergedroster = new MergedRoster({
    			props: { mergedUsers: /*chaosUsers*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mergedroster.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mergedroster, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mergedroster_changes = {};
    			if (dirty & /*chaosUsers*/ 1) mergedroster_changes.mergedUsers = /*chaosUsers*/ ctx[0];
    			mergedroster.$set(mergedroster_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mergedroster.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mergedroster.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mergedroster, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(153:1) {#if displayChaos}",
    		ctx
    	});

    	return block;
    }

    // (160:1) {#if displayJuggernauts}
    function create_if_block_2(ctx) {
    	let mergedroster;
    	let current;

    	mergedroster = new MergedRoster({
    			props: { mergedUsers: /*juggernautsUsers*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mergedroster.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mergedroster, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mergedroster_changes = {};
    			if (dirty & /*juggernautsUsers*/ 2) mergedroster_changes.mergedUsers = /*juggernautsUsers*/ ctx[1];
    			mergedroster.$set(mergedroster_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mergedroster.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mergedroster.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mergedroster, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(160:1) {#if displayJuggernauts}",
    		ctx
    	});

    	return block;
    }

    // (167:1) {#if displayPathfinders}
    function create_if_block_1(ctx) {
    	let mergedroster;
    	let current;

    	mergedroster = new MergedRoster({
    			props: { mergedUsers: /*pathfindersUsers*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mergedroster.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mergedroster, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mergedroster_changes = {};
    			if (dirty & /*pathfindersUsers*/ 4) mergedroster_changes.mergedUsers = /*pathfindersUsers*/ ctx[2];
    			mergedroster.$set(mergedroster_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mergedroster.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mergedroster.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mergedroster, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(167:1) {#if displayPathfinders}",
    		ctx
    	});

    	return block;
    }

    // (174:1) {#if displayEmpty}
    function create_if_block(ctx) {
    	let mergedroster;
    	let current;

    	mergedroster = new MergedRoster({
    			props: { mergedUsers: /*emptyUsers*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mergedroster.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mergedroster, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mergedroster_changes = {};
    			if (dirty & /*emptyUsers*/ 8) mergedroster_changes.mergedUsers = /*emptyUsers*/ ctx[3];
    			mergedroster.$set(mergedroster_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mergedroster.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mergedroster.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mergedroster, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(174:1) {#if displayEmpty}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div11;
    	let div5;
    	let input0;
    	let t0;
    	let label0;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div0;
    	let t3;
    	let button0;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let div2;
    	let t6;
    	let input1;
    	let t7;
    	let label1;
    	let div4;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div3;
    	let t10;
    	let button1;
    	let div6;
    	let t12;
    	let t13;
    	let button2;
    	let div7;
    	let t15;
    	let t16;
    	let button3;
    	let div8;
    	let t18;
    	let t19;
    	let button4;
    	let div9;
    	let t21;
    	let t22;
    	let div10;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*displayChaos*/ ctx[4] && create_if_block_3(ctx);
    	let if_block1 = /*displayJuggernauts*/ ctx[5] && create_if_block_2(ctx);
    	let if_block2 = /*displayPathfinders*/ ctx[6] && create_if_block_1(ctx);
    	let if_block3 = /*displayEmpty*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "OPEN FILE";
    			t3 = space();
    			button0 = element("button");
    			img1 = element("img");
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "Load bungie";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			label1 = element("label");
    			div4 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div3 = element("div");
    			div3.textContent = "OPEN HTML";
    			t10 = space();
    			button1 = element("button");
    			div6 = element("div");
    			div6.textContent = "CHAOS";
    			t12 = space();
    			if (if_block0) if_block0.c();
    			t13 = space();
    			button2 = element("button");
    			div7 = element("div");
    			div7.textContent = "JUGGERNAUTS";
    			t15 = space();
    			if (if_block1) if_block1.c();
    			t16 = space();
    			button3 = element("button");
    			div8 = element("div");
    			div8.textContent = "PATHFINDERS";
    			t18 = space();
    			if (if_block2) if_block2.c();
    			t19 = space();
    			button4 = element("button");
    			div9 = element("div");
    			div9.textContent = "noclan";
    			t21 = space();
    			if (if_block3) if_block3.c();
    			t22 = space();
    			div10 = element("div");
    			attr_dev(input0, "class", "inputfile");
    			attr_dev(input0, "name", "file");
    			attr_dev(input0, "id", "file");
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "accept", ".tsv");
    			set_style(input0, "opacity", "0");
    			set_style(input0, "width", "0");
    			add_location(input0, file$1, 123, 2, 2889);
    			attr_dev(img0, "class", "icon svelte-1n5iqt7");
    			if (!src_url_equal(img0.src, img0_src_value = "./fileicon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 126, 4, 3082);
    			add_location(div0, file$1, 127, 4, 3134);
    			attr_dev(div1, "class", "btn-item-action svelte-1n5iqt7");
    			add_location(div1, file$1, 125, 3, 3045);
    			attr_dev(label0, "for", "file");
    			add_location(label0, file$1, 124, 2, 3022);
    			attr_dev(img1, "class", "icon svelte-1n5iqt7");
    			if (!src_url_equal(img1.src, img1_src_value = "./fileicon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 132, 3, 3252);
    			add_location(div2, file$1, 133, 3, 3303);
    			attr_dev(button0, "class", "btn-item-action svelte-1n5iqt7");
    			add_location(button0, file$1, 131, 2, 3185);
    			attr_dev(input1, "class", "inputfile");
    			attr_dev(input1, "name", "htmlFile");
    			attr_dev(input1, "id", "htmlFile");
    			attr_dev(input1, "type", "file");
    			attr_dev(input1, "accept", ".html");
    			set_style(input1, "opacity", "0");
    			set_style(input1, "width", "0");
    			add_location(input1, file$1, 136, 2, 3347);
    			attr_dev(img2, "class", "icon svelte-1n5iqt7");
    			if (!src_url_equal(img2.src, img2_src_value = "./htmlicon.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$1, 139, 4, 3554);
    			add_location(div3, file$1, 140, 4, 3606);
    			attr_dev(div4, "class", "btn-item-action svelte-1n5iqt7");
    			add_location(div4, file$1, 138, 3, 3517);
    			attr_dev(label1, "for", "htmlFile");
    			add_location(label1, file$1, 137, 2, 3490);
    			attr_dev(div5, "class", "btn-panel svelte-1n5iqt7");
    			add_location(div5, file$1, 121, 1, 2858);
    			attr_dev(div6, "class", "title svelte-1n5iqt7");
    			add_location(div6, file$1, 150, 2, 3755);
    			attr_dev(button1, "class", "btn-hide svelte-1n5iqt7");
    			add_location(button1, file$1, 149, 1, 3691);
    			attr_dev(div7, "class", "title svelte-1n5iqt7");
    			add_location(div7, file$1, 157, 2, 3950);
    			attr_dev(button2, "class", "btn-hide svelte-1n5iqt7");
    			add_location(button2, file$1, 156, 1, 3880);
    			attr_dev(div8, "class", "title svelte-1n5iqt7");
    			add_location(div8, file$1, 164, 2, 4163);
    			attr_dev(button3, "class", "btn-hide svelte-1n5iqt7");
    			add_location(button3, file$1, 163, 1, 4093);
    			attr_dev(div9, "class", "title svelte-1n5iqt7");
    			add_location(div9, file$1, 171, 2, 4370);
    			attr_dev(button4, "class", "btn-hide svelte-1n5iqt7");
    			add_location(button4, file$1, 170, 1, 4306);
    			set_style(div10, "height", "10rem");
    			add_location(div10, file$1, 177, 1, 4495);
    			attr_dev(div11, "class", "root-div svelte-1n5iqt7");
    			add_location(div11, file$1, 117, 0, 2808);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, input0);
    			append_dev(div5, t0);
    			append_dev(div5, label0);
    			append_dev(label0, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div5, t3);
    			append_dev(div5, button0);
    			append_dev(button0, img1);
    			append_dev(button0, t4);
    			append_dev(button0, div2);
    			append_dev(div5, t6);
    			append_dev(div5, input1);
    			append_dev(div5, t7);
    			append_dev(div5, label1);
    			append_dev(label1, div4);
    			append_dev(div4, img2);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div11, t10);
    			append_dev(div11, button1);
    			append_dev(button1, div6);
    			append_dev(div11, t12);
    			if (if_block0) if_block0.m(div11, null);
    			append_dev(div11, t13);
    			append_dev(div11, button2);
    			append_dev(button2, div7);
    			append_dev(div11, t15);
    			if (if_block1) if_block1.m(div11, null);
    			append_dev(div11, t16);
    			append_dev(div11, button3);
    			append_dev(button3, div8);
    			append_dev(div11, t18);
    			if (if_block2) if_block2.m(div11, null);
    			append_dev(div11, t19);
    			append_dev(div11, button4);
    			append_dev(button4, div9);
    			append_dev(div11, t21);
    			if (if_block3) if_block3.m(div11, null);
    			append_dev(div11, t22);
    			append_dev(div11, div10);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*onTsvFileOpen*/ ctx[12], false, false, false),
    					listen_dev(button0, "click", /*onBungieLoadClick*/ ctx[14], false, false, false),
    					listen_dev(input1, "change", /*onHtmlFileOpen*/ ctx[13], false, false, false),
    					listen_dev(button1, "click", /*switchChaosVisibility*/ ctx[8], false, false, false),
    					listen_dev(button2, "click", /*switchJuggernautsVisibility*/ ctx[9], false, false, false),
    					listen_dev(button3, "click", /*switchPathfindersVisibility*/ ctx[10], false, false, false),
    					listen_dev(button4, "click", /*switchEmptyVisibility*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayChaos*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*displayChaos*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div11, t13);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*displayJuggernauts*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*displayJuggernauts*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div11, t16);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*displayPathfinders*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*displayPathfinders*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div11, t19);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*displayEmpty*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*displayEmpty*/ 128) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div11, t22);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainScreen', slots, []);
    	let chaosUsers = new Array();
    	let juggernautsUsers = new Array();
    	let pathfindersUsers = new Array();
    	let emptyUsers = new Array();
    	let mainMerger = new Merger();
    	let displayChaos = true;
    	let displayJuggernauts = true;
    	let displayPathfinders = true;
    	let displayEmpty = true;

    	function switchChaosVisibility() {
    		$$invalidate(4, displayChaos = !displayChaos);
    	}

    	function switchJuggernautsVisibility() {
    		$$invalidate(5, displayJuggernauts = !displayJuggernauts);
    	}

    	function switchPathfindersVisibility() {
    		$$invalidate(6, displayPathfinders = !displayPathfinders);
    	}

    	function switchEmptyVisibility() {
    		$$invalidate(7, displayEmpty = !displayEmpty);
    	}

    	/** Reloads UI arrays from the model (mainMerger) */
    	function reloadArrays() {
    		$$invalidate(0, chaosUsers = mainMerger.mergedUsers.get('chaos'));
    		$$invalidate(1, juggernautsUsers = mainMerger.mergedUsers.get('juggernauts'));
    		$$invalidate(2, pathfindersUsers = mainMerger.mergedUsers.get('pathfinders'));
    		$$invalidate(3, emptyUsers = mainMerger.mergedUsers.get('empty'));
    	}

    	/** Processes user tsv file inputv */
    	async function onTsvFileOpen(e) {
    		await mainMerger.openTsvFile(e);
    		mainMerger.mergeUsers();
    		reloadArrays();
    	}

    	async function onHtmlFileOpen(e) {
    		await mainMerger.openHtmlFile(e);
    		mainMerger.mergeUsers();
    		reloadArrays();
    	}

    	/** Processes bungie button click and loads bungie users */
    	async function onBungieLoadClick() {
    		await mainMerger.loadBungieUsers();
    		mainMerger.mergeUsers();
    		reloadArrays();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MergedRoster,
    		Merger,
    		chaosUsers,
    		juggernautsUsers,
    		pathfindersUsers,
    		emptyUsers,
    		mainMerger,
    		displayChaos,
    		displayJuggernauts,
    		displayPathfinders,
    		displayEmpty,
    		switchChaosVisibility,
    		switchJuggernautsVisibility,
    		switchPathfindersVisibility,
    		switchEmptyVisibility,
    		reloadArrays,
    		onTsvFileOpen,
    		onHtmlFileOpen,
    		onBungieLoadClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('chaosUsers' in $$props) $$invalidate(0, chaosUsers = $$props.chaosUsers);
    		if ('juggernautsUsers' in $$props) $$invalidate(1, juggernautsUsers = $$props.juggernautsUsers);
    		if ('pathfindersUsers' in $$props) $$invalidate(2, pathfindersUsers = $$props.pathfindersUsers);
    		if ('emptyUsers' in $$props) $$invalidate(3, emptyUsers = $$props.emptyUsers);
    		if ('mainMerger' in $$props) mainMerger = $$props.mainMerger;
    		if ('displayChaos' in $$props) $$invalidate(4, displayChaos = $$props.displayChaos);
    		if ('displayJuggernauts' in $$props) $$invalidate(5, displayJuggernauts = $$props.displayJuggernauts);
    		if ('displayPathfinders' in $$props) $$invalidate(6, displayPathfinders = $$props.displayPathfinders);
    		if ('displayEmpty' in $$props) $$invalidate(7, displayEmpty = $$props.displayEmpty);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chaosUsers,
    		juggernautsUsers,
    		pathfindersUsers,
    		emptyUsers,
    		displayChaos,
    		displayJuggernauts,
    		displayPathfinders,
    		displayEmpty,
    		switchChaosVisibility,
    		switchJuggernautsVisibility,
    		switchPathfindersVisibility,
    		switchEmptyVisibility,
    		onTsvFileOpen,
    		onHtmlFileOpen,
    		onBungieLoadClick
    	];
    }

    class MainScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainScreen",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let mainscreen;
    	let current;
    	mainscreen = new MainScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(mainscreen.$$.fragment);
    			add_location(main, file, 3, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(mainscreen, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mainscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mainscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(mainscreen);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MainScreen });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
