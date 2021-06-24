/**
* @file 编辑器内部用，改变编辑元素的默认四个角，包括形状、功能（删除、旋转、放大、复制）
* @author sunkeke
* @date 2021-05-26
*/

import {fabric} from 'fabric';

export const tl = fabric.Object.prototype.controls.tl;
export const tr = fabric.Object.prototype.controls.tr;
export const bl = fabric.Object.prototype.controls.bl;

function changeDefaultCorner(proto, canvas, theme) {

    proto.transparentCorners = false;
    proto.cornerColor = theme ?? '#55f';
    proto.borderColor = theme ?? '#55f';
    proto.cornerSize = 8;
    proto.cornerStyle = 'circle';
    proto.borderOpacityWhenMoving = 1;

    let delIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMXB4IiB2aWV3Qm94PSIwIDAgMjAgMjEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+57yW57uEIDM3PC90aXRsZT4KICAgIDxnIGlkPSLpobXpnaItMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuWwgemdoue8lui+kXVpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjUwMy4wMDAwMDAsIC0xMTAxLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0i57yW57uELTg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDE1LjAwMDAwMCwgOTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC00MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDg3LjAwMDAwMCwgMTc3LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtMzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEuMDAwMDAwLCA1LjA5ODAxOSkiPgogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSLmpK3lnIblvaIiIGZpbGw9IiNGRkZGRkYiIGN4PSIxMCIgY3k9IjEwIiByPSIxMCI+PC9jaXJjbGU+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMC4xMzA5Miw0LjYxMTM3Mjk2IEMxMC41NDUxMzM2LDQuNjExMzcyOTYgMTAuODgwOTIsNC45NDcxNTk0IDEwLjg4MDkyLDUuMzYxMzcyOTYgTDEwLjg4MDkyLDE0Ljg2MTM3MyBDMTAuODgwOTIsMTUuMjc1NTg2NSAxMC41NDUxMzM2LDE1LjYxMTM3MyAxMC4xMzA5MiwxNS42MTEzNzMgQzkuNzE2NzA2NDMsMTUuNjExMzczIDkuMzgwOTE5OTksMTUuMjc1NTg2NSA5LjM4MDkxOTk5LDE0Ljg2MTM3MyBMOS4zODA5MTk5OSw1LjM2MTM3Mjk2IEM5LjM4MDkxOTk5LDQuOTQ3MTU5NCA5LjcxNjcwNjQzLDQuNjExMzcyOTYgMTAuMTMwOTIsNC42MTEzNzI5NiBaIiBpZD0i55+p5b2iIiBmaWxsPSIjMzMzMzMzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMC4xMzA5MjAsIDEwLjExMTM3Mykgcm90YXRlKC0zMTUuMDAwMDAwKSB0cmFuc2xhdGUoLTEwLjEzMDkyMCwgLTEwLjExMTM3MykgIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMC4xMzA5Miw0LjYxMTM3Mjk2IEMxMC41NDUxMzM2LDQuNjExMzcyOTYgMTAuODgwOTIsNC45NDcxNTk0IDEwLjg4MDkyLDUuMzYxMzcyOTYgTDEwLjg4MDkyLDE0Ljg2MTM3MyBDMTAuODgwOTIsMTUuMjc1NTg2NSAxMC41NDUxMzM2LDE1LjYxMTM3MyAxMC4xMzA5MiwxNS42MTEzNzMgQzkuNzE2NzA2NDMsMTUuNjExMzczIDkuMzgwOTE5OTksMTUuMjc1NTg2NSA5LjM4MDkxOTk5LDE0Ljg2MTM3MyBMOS4zODA5MTk5OSw1LjM2MTM3Mjk2IEM5LjM4MDkxOTk5LDQuOTQ3MTU5NCA5LjcxNjcwNjQzLDQuNjExMzcyOTYgMTAuMTMwOTIsNC42MTEzNzI5NiBaIiBpZD0i55+p5b2i5aSH5Lu9LTI0IiBmaWxsPSIjMzMzMzMzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMC4xMzA5MjAsIDEwLjExMTM3Mykgcm90YXRlKC0yMjUuMDAwMDAwKSB0cmFuc2xhdGUoLTEwLjEzMDkyMCwgLTEwLjExMTM3MykgIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
    let rotateIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMXB4IiB2aWV3Qm94PSIwIDAgMjAgMjEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+57yW57uEIDM5PC90aXRsZT4KICAgIDxnIGlkPSLpobXpnaItMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuWwgemdoue8lui+kXVpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjY3MC4wMDAwMDAsIC0xMTAxLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0i57yW57uELTg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDE1LjAwMDAwMCwgOTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC00MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDg3LjAwMDAwMCwgMTc3LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtMzkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2My4wMDAwMDAsIDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9IuakreWchuW9ouWkh+S7vS01IiBmaWxsPSIjRkZGRkZGIiBjeD0iMTQuOTg4MzU0MyIgY3k9IjE1LjA5ODAxOTUiIHI9IjEwIj48L2NpcmNsZT4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0zNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQuNTAwMDAwLCAxNS4wMDAwMDApIHJvdGF0ZSg0NC4wMDAwMDApIHRyYW5zbGF0ZSgtMTQuNTAwMDAwLCAtMTUuMDAwMDAwKSB0cmFuc2xhdGUoNC4wMDAwMDAsIDUuMDAwMDAwKSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtMzYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLjU1OTcxMywgMTAuMDc4NTk5KSByb3RhdGUoMTguMDAwMDAwKSB0cmFuc2xhdGUoLTEwLjU1OTcxMywgLTEwLjA3ODU5OSkgdHJhbnNsYXRlKDMuMDU5NzEzLCAyLjA3ODU5OSkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03LjUsMi44MTE2OTIzNiBDOC40MDM4NDQ2MywyLjgxMTY5MjM2IDkuMjc1MzI3NDEsMy4wNDEwODQ3IDEwLjA0NjgyNDMsMy40Njk4NTU0MSBMMTAuNTAzMjksMy43NDY3MTM3OCBMMTEuNzIwMjM2OSw0LjUwOTA3NDY4IEwxMC44NjE1NTY5LDUuNzM4OTgwNyBMOS40OTkxOTc1Miw0Ljg4ODM1MTE4IEM4LjkwNTU5Mjg3LDQuNTEzNDM4NDYgOC4yMTg2MzIxLDQuMzExNjkyMzYgNy41LDQuMzExNjkyMzYgQzUuNDI4OTMyMTksNC4zMTE2OTIzNiAzLjc1LDUuOTkwNjI0NTUgMy43NSw4LjA2MTY5MjM2IEMzLjc1LDEwLjEzMjc2MDIgNS40Mjg5MzIxOSwxMS44MTE2OTI0IDcuNSwxMS44MTE2OTI0IEM5LjUwNDI1OTE3LDExLjgxMTY5MjQgMTEuMTQxMjczNywxMC4yMzkzMzEzIDExLjI0NDgwMiw4LjI2MDg1MDkzIEwxMS4yNSw4LjA2MTY5MjM2IEwxMi43NSw4LjA2MTY5MjM2IEMxMi43NSwxMC45NjExODczIDEwLjM5OTQ5NDksMTMuMzExNjkyNCA3LjUsMTMuMzExNjkyNCBDNC42MDA1MDUwNiwxMy4zMTE2OTI0IDIuMjUsMTAuOTYxMTg3MyAyLjI1LDguMDYxNjkyMzYgQzIuMjUsNS4xNjIxOTc0MiA0LjYwMDUwNTA2LDIuODExNjkyMzYgNy41LDIuODExNjkyMzYgWiIgaWQ9Iui3r+W+hCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNy41MDAwMDAsIDguMDYxNjkyKSByb3RhdGUoLTMwLjAwMDAwMCkgdHJhbnNsYXRlKC03LjUwMDAwMCwgLTguMDYxNjkyKSAiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0i6Lev5b6EIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4LjE4NjE0NiwgMy42OTE3NjIpIHJvdGF0ZSgtNDUuMDAwMDAwKSB0cmFuc2xhdGUoLTguMTg2MTQ2LCAtMy42OTE3NjIpICIgcG9pbnRzPSIxMC4yMTk5NTg3IDEuNzU2NTcxNjMgMTAuMjAxMzAxNSA1LjU4NTE3MzE1IDYuMTY3ODcwNzggNS42MjY5NTMxNSA2LjE1MjMzMzk3IDQuMTI3MDMzNjEgOC43MDEyNzAwOSA0LjEwMDkzOTkxIDguNzE5OTU4NjYgMS43NTY1NzE2MyI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
    let scaleIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjFweCIgaGVpZ2h0PSIyMXB4IiB2aWV3Qm94PSIwIDAgMjEgMjEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+57yW57uEIDQwPC90aXRsZT4KICAgIDxnIGlkPSLpobXpnaItMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuWwgemdoue8lui+kXVpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjY2OS4wMDAwMDAsIC0xMTQ5LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0i57yW57uELTg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDE1LjAwMDAwMCwgOTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC00MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDg3LjAwMDAwMCwgMTc3LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtNDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2Ny45ODgzNTQsIDUzLjA5ODAxOSkiPgogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSLmpK3lnIblvaLlpIfku70tNiIgZmlsbD0iI0ZGRkZGRiIgY3g9IjEwIiBjeT0iMTAiIHI9IjEwIj48L2NpcmNsZT4KICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0LDEwIEwxNCwxNCBMMTAsMTQgTTYsMTAgTDYsNiBMMTAsNiIgaWQ9IuW9oueKtiIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjEuNSI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';
    let copyIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMXB4IiB2aWV3Qm94PSIwIDAgMjAgMjEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+57yW57uEIDM4PC90aXRsZT4KICAgIDxnIGlkPSLpobXpnaItMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuWwgemdoue8lui+kXVpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjUwMi4wMDAwMDAsIC0xMTQ5LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0i57yW57uELTg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDE1LjAwMDAwMCwgOTE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC00MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDg3LjAwMDAwMCwgMTc3LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtMzgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA1My4wOTgwMTkpIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0i5qSt5ZyG5b2i5aSH5Lu9LTQiIGZpbGw9IiNGRkZGRkYiIGN4PSIxMCIgY3k9IjEwIiByPSIxMCI+PC9jaXJjbGU+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHg9IjUuNzUiIHk9IjguNzUiIHdpZHRoPSI1LjUiIGhlaWdodD0iNS41Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5bGluZSBpZD0i6Lev5b6EIiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMS41IiBwb2ludHM9IjkgNiAxNCA2IDE0IDExIj48L3BvbHlsaW5lPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

    let delImg = new Image();
    let rotateImg = new Image();
    let scaleImg = new Image();
    let copyImg = new Image();
    delImg.src = delIcon;
    rotateImg.src = rotateIcon;
    scaleImg.src = scaleIcon;
    copyImg.src = copyIcon;

    proto.controls.tl = new fabric.Control({
        x: -0.5,
        y: -0.5,
        // offsetY: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: deleteObject,
        render: renderDelIcon,
    });
    proto.controls.bl = new fabric.Control({
        x: -0.5,
        y: 0.5,
        cursorStyle: 'pointer',
        mouseUpHandler: copyObject,
        render: renderCopyIcon
    });

    proto.controls.tr = new fabric.Control({
        ...proto.controls.mtr,
        render: renderRotateIcon,
        cursorStyle: 'pointer',
        x: 0.5,
        y: -0.5,
        offsetY: 0
    });
    proto.controls.br.render = function renderScaleObject(ctx, left, top, styleOverride, fabricObject) {
        const size = styleOverride.cornerSize || fabricObject.cornerSize;
        ctx.save();
        ctx.drawImage(scaleImg, left - size, top - size, size * 2, size * 2);
        ctx.restore();
    };

    function deleteObject(e, target, control) {
        target.isRemoved = true;
        canvas.remove(target);
        canvas.renderAll();
        canvas.fire('user:pushHistory');
    }
    function copyObject(e, target) {
        target.clone(function(cloned) {
            cloned.left += 10;
            cloned.top += 10;
            canvas.add(cloned);
            canvas.renderAll();
            canvas.fire('user:pushHistory');
        });
    }
    
    function renderDelIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = styleOverride.cornerSize || fabricObject.cornerSize;
        ctx.save();
        ctx.drawImage(delImg, left - size, top - size, size * 2, size * 2);
        ctx.restore();
    }
    function renderCopyIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = styleOverride.cornerSize || fabricObject.cornerSize;
        ctx.save();
        ctx.drawImage(copyImg, left - size, top - size, size * 2, size * 2);
        ctx.restore();
    }
    function renderRotateIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = styleOverride.cornerSize || fabricObject.cornerSize;
        ctx.save();
        ctx.drawImage(rotateImg, left - size, top - size, size * 2, size * 2);
        ctx.restore();
    }

}

export default changeDefaultCorner;
