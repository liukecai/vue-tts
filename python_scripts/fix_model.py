import onnx
import numpy as np
import os

# 修复模型中的类型不匹配问题
def fix_model(model_path, output_path):
    print(f"修复模型: {model_path}")
    
    # 加载模型
    model = onnx.load(model_path)
    
    # 创建新的节点列表
    new_nodes = []
    
    # 遍历所有节点
    for i, node in enumerate(model.graph.node):
        # 查找类型不匹配的Add节点
        if node.op_type == 'Add':
            # 确保两个输入都是相同类型
            # 这里我们强制将所有Add节点的输入转换为int64
            input1 = node.input[0]
            input2 = node.input[1]
            output = node.output[0]
            
            # 创建类型转换节点
            cast1 = onnx.helper.make_node(
                'Cast',
                inputs=[input1],
                outputs=[f"{input1}_cast"],
                to=onnx.TensorProto.INT64
            )
            
            cast2 = onnx.helper.make_node(
                'Cast',
                inputs=[input2],
                outputs=[f"{input2}_cast"],
                to=onnx.TensorProto.INT64
            )
            
            # 创建新的Add节点
            new_add = onnx.helper.make_node(
                'Add',
                inputs=[f"{input1}_cast", f"{input2}_cast"],
                outputs=[output]
            )
            
            # 添加到新节点列表
            new_nodes.extend([cast1, cast2, new_add])
        else:
            # 保持其他节点不变
            new_nodes.append(node)
    
    # 替换模型中的节点
    del model.graph.node[:]
    model.graph.node.extend(new_nodes)
    
    # 保存修复后的模型
    onnx.save(model, output_path)
    print(f"修复后的模型保存到: {output_path}")

# 修复编码器和解码器模型
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx"

# 修复量化后的模型
encoder_q4 = os.path.join(model_dir, "encoder_model_q4.onnx")
decoder_q4 = os.path.join(model_dir, "decoder_model_merged_q4.onnx")

fixed_encoder = os.path.join(model_dir, "encoder_model_q4_fixed_final.onnx")
fixed_decoder = os.path.join(model_dir, "decoder_model_merged_q4_fixed_final.onnx")

# 执行修复
fix_model(encoder_q4, fixed_encoder)
fix_model(decoder_q4, fixed_decoder)

print("\n所有模型修复完成！")